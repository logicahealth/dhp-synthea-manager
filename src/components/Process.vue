<template>
  <div>
    <h1>Synthea Process</h1>

    <transition name="fade-menu" mode="out-in">
      <article v-if="displayFeedback" class="message" :class="isSuccessMessage">
        <div class="message-header">
          <p v-if="isOpSuccess">Success</p>
          <p v-else>Error</p>
          <button class="delete" aria-label="delete" @click="displayFeedback = false"></button>
        </div>
        <div class="message-body">
          <p v-if="isOpSuccess">Synthea Patient(s) has been created successfully.</p>
          <p v-else>Error in creating Synthea Patient(s). Please try again later.</p>
        </div>
      </article>
    </transition>

    <details open id="synthea">
        <summary  class="columns">
          Generate Patients
        </summary>
        <details open class="column">
          <summary  class="columns">
            <h3> Parameters: </h3>
          </summary>
          <div class="dxc-details-content">
          <table>
            <tr>
              <td>
                <label class="label" for="fileCount"># of patients to create:</label>
                <span class="control">
                <input v-model='fileCount' id="fileCount" class="input" type="text"/>
                </span>
              </td>
            </tr>
            <tr>
              <td>
                <label class="label" for="state">State:</label>
                <span class="control">
                <input style='width: 150px;' v-model='state' id="state" class="input" type="text"/>
                </span>
              </td>
            </tr>
            <tr>
              <td>
                <label class="label" for="city">City limitation:</label>
                <span class="control">
                <input style='width: 150px;' v-model='city' id="city" class="input" type="text"/>
                </span>
              </td>
            </tr>
            <tr>
              <td>
                <label class="label" for="minAge">Minimum Age:</label>
                <span class="control">
                <input v-model='minAge' id="minAge" class="input" type="text"/>
                </span>
              </td>
            </tr>
            <tr>
              <td>
                <label class="label" for="maxAge">Maximum Age:</label>
                <span class="control">
                <input v-model='maxAge' id="maxAge" class="input" type="text"/>
                </span>
              </td>
            </tr>
            <tr>
              <td>
                <label class="label" for="gender">Gender limitation:</label>
                <span class="control">
                <input v-model='gender' id="gender" class="input" type="text"/>
                </span>
              </td>
            </tr>
            <tr>
              <td>
                <label class="label" for="seed">Seed Value:</label>
                <span class="control">
                <input style="width: 150px;" v-model='seed' id="seed" class="input" type="text"/>
                </span>
              </td>
            </tr>
          </table>
          <button class="dxc-btn-link em" v-on:click="createPatients(fileCount)">Create Patients</button>
            </div>
        </details>
        <div class="column prsp-wait">
          <stretch  background="#363636" v-if="processingFiles === true"></stretch>
        </div>

      <div class="dxc-details-content">
        <div class="columns">
          <div class="subtitle column">Created Synthetic Patients:
            <div>
              <stretch  background="#363636" v-if="workingOnIt === true"></stretch>
            </div>
          </div>
          <div id="processResults" class="help is-danger">{{view.processResults}}</div>
        </div>
        <details>
         <summary class="columns">
           <h3> Known Problems</h3>
         </summary>
        <div class="dxc-details-content">
          <button class="dxc-btn-link em" v-on:click="posFilter = [];negFilter=[]"> Clear Filter</button>
          </span>
          <h6>Showing patient with these problems</h6>
          <ul style="columns:4;">
            <li class="dxc-btn-link" style="font-size: 70%;" v-for="problem in posFilter" v-bind:key="problem" v-on:click="updateFilters(problem)">{{problem}}</li>
          </ul>
          </ul>
          <h6>and without:</h6>
          <ul style="columns:4;">
            <li class="dxc-btn-link" style="font-size: 70%;" v-for="problem in negFilter" v-bind:key="problem" v-on:click="updateFilters(problem)">{{problem}}</li>
          </ul>
          <hr>
          <ul style="columns:4;">
            <li class="dxc-btn-link" style="font-size: 70%;" v-for="problem in Object.keys(totalProblems).sort()" v-bind:class="{active: posFilter.includes(problem), negative: negFilter.includes(problem)}" v-on:click="updateFilters(problem)">{{problem}} ({{totalProblems[problem]}})</li>
          </ul>
        </div>
		</details>
        <hr>
        <div v-for="(file, index) in fileList" class="columns">
          <div  v-if="filterProblems(file.problems)" class="column is-12">
            <div>
              <a v-on:click="getPatient(file, index)" title="View patient details">{{file.patientName}}</a>
              <button class="dxc-btn-link em" v-on:click="sendToVista(file, index)">Send to Vista</button>
              <button class="dxc-btn-link em" v-on:click="getVizData(file, index)">OSEHRA Patient Visualization</button>
              <span v-if="displayOHC"><button :disabled="file.icn !== ''" :id='"ohcButton_" + index' class="dxc-btn-link em" v-on:click="sendToOHC(file, index)">Send to OHC</button></span>
              </br>

            </div>
            <div>Vista ICN:
              <span :id='"vistaICN_" + index'></span>
            </div>
            <div v-if="displayOHC">OHC ICN:
              <span :id='"ohcICN_" + index'></span>
            </div>
            <tree-view :data="file.patientJSON" :options="{maxDepth: 0, modifiable: false}"></tree-view>
          </div>
        </div>
      </div>
    </details>
  </div>
</template>
<script>
  import axios from 'axios'
  import TreeView from 'vue-json-tree-view'
  import Vue from 'vue'
  import {Stretch} from 'vue-loading-spinner'

  Vue.use(TreeView)

  export default {
    name: 'Patient',
    data: function () {
      return {
        view: {
          header: 'Loading...',
          bundles: [],
          bundleName: 'Process',
          displayName: 'Process',
          processResults: ''
        },
        msg: 'Process',
        url: process.env.SYNTHEA_URL,
        displayOHC: false,
        fileList: [],
        file: {
          patientName: '',
          url: '',
          fileName: '',
          patientJSON: {},
          icn: ''
        },
        processingFiles: false,
        workingOnIt: false,
        fileCount: '',
        state: 'Massachusetts',
        maxAge: '140',
        minAge: '0',
        city: '',
        gender: '',
        seed: '',
        years: '10',
        displayFeedback: false,
        isOpSuccess: true,
        isSearchValid: true,
        posFilter: [],
        negFilter: [],
        OP_SUCCESS: true,
        OP_FAIL: false,
        totalProblems: []
      }
    },
    components: {
      Stretch
    },
    computed: {
      isErrorControl () {
        return this.isSearchValid ? '' : 'is-danger'
      },
      isSuccessMessage () {
        return this.isOpSuccess ? 'is-success' : 'is-danger'
      }
    },
    methods: {
      showMessageBox (success) {
        this.isOpSuccess = success
        this.displayFeedback = true
        // temp solution to ensure message box is visible
        window.scroll(0, 0)

        // auto disappear...
        setTimeout(() => {
          this.displayFeedback = false
        }, 7000)
      },
      filterProblems: function (problems) {
        var show = true
        if (this.posFilter.length === 0 && this.negFilter.length === 0) {
          return show
        }
        show = this.posFilter.every(cond => problems.includes(cond))
        if (show && (this.negFilter.length > 0)) {
          show = !this.negFilter.every(cond => problems.includes(cond))
        }
        return show
      },
      updateFilters: function (problem) {
        const self = this
        if (this.posFilter.indexOf(problem) !== -1) {
          self.posFilter = self.posFilter.filter(word => word !== problem)
          self.negFilter.push(problem)
        } else if (this.negFilter.indexOf(problem) !== -1) {
          self.negFilter = self.negFilter.filter(word => word !== problem)
        } else {
          self.posFilter.push(problem)
        }
      },
      createPatients: async function (count) {
        const baseUrl = process.env.SYNTHEA_URL
        var url = baseUrl + 'synthea/synthea-run?population=' + count
        url += '&state=' + this.state
        url += '&gender=' + this.gender
        url += '&city=' + this.city
        url += '&ageRange=' + this.minAge + '-' + this.maxAge
        url += '&seed=' + this.seed
        const self = this
        self.view.processResults = ''
        self.fileList = []
        self.processingFiles = true

        axios.get(url)
          .then(function (response) {
            console.log(response)
            checkProcessStatus()
          })
          .catch(function (error) {
            console.log(error)
            self.showMessageBox(self.OP_FAIL)
            self.processingFiles = false
          })

        async function checkProcessStatus () {
          const baseUrl = process.env.SYNTHEA_URL
          const url = baseUrl + 'synthea/synthea-progress'
          // for (let i = 0; i < 500; i++) {
          let processing = true
          while (processing) {
            await axios.get(url)
              .then(function (response) {
                console.log(response.data.running)
                if (response !== undefined && response.data.running === false) {
                  processing = false
                }
                if (processing === false) {
                  self.processingFiles = false
                  getPatientFiles(self)
                }
              })
              .catch(function (error) {
                console.log(error)
                self.showMessageBox(self.OP_FAIL)
                self.processingFiles = false
              })
          }
        }
        function getPatientFiles (self) {
          // LIst of Patients to display
          const baseUrl = process.env.SYNTHEA_URL
          const url = baseUrl + 'synthea/patient-files'
          self.totalProblems = {}
          self.posFilter = []
          self.negFilter = []
          axios.get(url)
            .then(function (response) {
              console.log(response)
              if (response.data !== undefined && response.data.length > 0) {
                self.fileList = response.data
              }
              self.fileList.forEach(function (file) {
                // Creates a unique list of problems to ensure multiple instances
                // of the same problem are not counted
                [...new Set(file.problems)].forEach(function (problem) {
                  if (Object.keys(self.totalProblems).indexOf(problem) === -1) {
                    self.totalProblems[problem] = 0
                  }
                  self.totalProblems[problem]++
                })
              })
              // expand details block
              document.getElementById('synthea').setAttribute('open', '')
              self.showMessageBox(self.OP_SUCCESS)
            })
            .catch(function (error) {
              console.log(error)
              self.showMessageBox(self.OP_FAIL)
              self.processingFiles = false
            })
        }
      },
      getPatient: async function (file, index) {
        // LIst of Patients to display
        let self = this
        self.view.processResults = ''
        self.workingOnIt = true
        const baseUrl = process.env.SYNTHEA_URL
        const url = baseUrl + 'synthea/patient?fileName=' + file.fileName
        console.log(url)
        let fileData
        await axios.get(url)
          .then(function (response) {
            if (response.data !== undefined) {
              file.patientJSON = response.data
              fileData = response.data
              self.view.processResults = ''
            }
          })
          .catch(function (error) {
            console.log(error)
            if (error.message !== undefined && error.message === 'Network Error') {
              self.view.processResults = 'Request has timed-out - try again'
            } else if (error.response.data !== undefined && error.response.data === 'Invalid CORS request') {
              self.view.processResults = 'Check your browsers CORS settings - try again'
            } else {
              console.log(error)
              self.view.processResults = 'Error retrieving patient json file'
            }
          })

        Vue.set(file, 'patientJSON', fileData)
        self.workingOnIt = false
      },
      getVizData: async function (file, index) {
        const self = this
        self.view.processResults = ''
        const url = process.env.VIZ_URL
        const baseUrl = process.env.SYNTHEA_URL
        const dataURL = baseUrl + 'synthea/patient?fileName=' + file.fileName
        var instance = axios.create()
        var instance2 = axios.create()
        instance.timeout = 360000
        instance.get(dataURL).then(function (response) {
          instance2.post(url, response.data, {
            headers: {
              'content-type': 'application/json'
            }
          }).then(function (putResp) {
            if (putResp !== undefined) {
              var visWindow = window.open('', '_blank')
              visWindow.document.write(putResp.data)
              visWindow.document.close()
            }
          }).catch(function (error) {
            if (error.message !== undefined && error.message === 'Network Error') {
              self.view.processResults = 'Request has timed-out - try again'
            }
          })
        })
      },
      sendToVista: async function (file, index) {
        const self = this
        self.workingOnIt = true
        self.view.processResults = ''
        const baseUrl = process.env.SYNTHEA_URL
        const url = baseUrl + 'synthea/vista-export?fileName=' + file.fileName
        var instance = axios.create()
        // Override timeout default for the library
        // Now all requests will wait 2.5 seconds before timing out
        instance.timeout = 360000

        // {"vistaSuccess":true,"ohcSuccess":false,"error":null,"icn":"5123457820V116090"}
        let processing = true
        let icn = ''
        while (processing) {
          await instance.post(url)
            .then(function (response) {
              console.log(response)
              if (response !== undefined) {
                let id = 'vistaICN_' + index
                icn = response.data.icn
                document.getElementById(id).innerHTML = icn
                file.icn = icn
                let buttonId = 'ohcButton_' + index
                document.getElementById(buttonId).removeAttribute('disabled')
                processing = false
              }
              if (processing === false) {
                self.workingOnIt = false
                // self.sendToOHC(file, index, icn)
              }
            })
            .catch(function (error) {
              self.workingOnIt = false
              processing = false
              if (error.message !== undefined && error.message === 'Network Error') {
                self.view.processResults = 'Request has timed-out - try again'
              } else if (error.response.data !== undefined && error.response.data === 'Invalid CORS request') {
                self.view.processResults = 'Check your browsers CORS settings - try again'
              } else {
                console.log(error)
                self.view.processResults = 'Error sending patient json file to vista - try again'
              }
            })
        }
      },
      sendToOHC: async function (file, index) {
        // https://vista-to-ohc-dev1.openplatform.healthcare/vistatoohcsingle?id=3421854171V257824
        const baseUrl = process.env.V2O_URL
        const url = baseUrl + 'vistatoohcsingle?id=' + file.icn
        const self = this
        self.workingOnIt = true
        self.view.processResults = ''
        var instance = axios.create()

        // Override timeout default for the library
        // Now all requests will wait 2.5 seconds before timing out
        instance.timeout = 360000

        await instance.get(url)
          .then(function (response) {
            console.log(response)
            if (response !== undefined) {
              if (response.data.success === true) {
                let id = 'ohcICN_' + index
                document.getElementById(id).innerHTML = response.data.icn
              } else {
                self.view.processResults = response.data.error
              }
            }
            self.workingOnIt = false
          })
          .catch(function (error) {
            self.workingOnIt = false
            console.log(error)
            if (error.message !== undefined && error.message === 'Network Error') {
              self.view.processResults = 'Request has timed-out - try again'
            } else if (error.response.data !== undefined && error.response.data === 'Invalid CORS request') {
              self.view.processResults = 'Check your browsers CORS settings - try again'
            } else {
              console.log(error)
              self.view.processResults = 'Error retrieving patient json file from vista - try again'
            }
          })
      }
    },
    beforeMount: function () {
      const v2oURL = process.env.V2O_URL
      console.log(v2oURL)
      if (v2oURL !== undefined && v2oURL !== '') {
        this.displayOHC = true
      }
    }
  }
</script>

<style lang="scss" scoped>
  button {
    margin-left: 20px;
  }
  input {
    margin: 0 7px;
    width: 70px;
  }
  .label {
    display: inline-block;
    margin-top: 12px;
  }
  .hide {
    display: none;
  }
  .active{
    font-weight: bold;
  }
  .negative {
    font-weight: bold;
    color: red !important;
  }
  .show {
    animation: fade-in-error 0.5s ease-in forwards;
  // animation-iteration-count: 3;
  }
  button[disabled] {
    color: #707070 !important;
    cursor: not-allowed !important;
    text-decoration: none !important;
  }
  .prsp-wait {
    padding-top: 18px;
  }
</style>
