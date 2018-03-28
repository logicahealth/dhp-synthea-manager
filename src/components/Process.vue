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

    <details id="synthea">
      <summary class="columns">
        <div class="column">
          <label class="label" for="fileCount"># of patients to create</label>
          <span class="control">
            <input v-model='fileCount' id="fileCount" class="input">
          </span>
          <button class="dxc-btn-link em" v-on:click="createPatients(fileCount)">Create Patients</button>
        </div>
        <div class="column">
          <stretch  background="#363636" v-if="processingFiles === true"></stretch>
        </div>
      </summary>

      <div class="dxc-details-content">
        <div class="columns">
          <div class="subtitle column">Created Synthetic Patients:
            <div>
              <stretch  background="#363636" v-if="workingOnIt === true"></stretch>
            </div>
          </div>
        </div>
        <div v-for="(file, index) in fileList" class="columns">
          <div class="column is-12">
            <div>
              <a v-on:click="getPatient(file, index)" title="View patient details">{{file.patientName}}</a>
              <button class="dxc-btn-link em" v-on:click="sendToVista(file, index)">Send to Vista</button>
            </div>
            <div>Vista ICN:
              <span :id='"vistaICN_" + index'></span>
            </div>
            <div>OHC ICN:
              <span :id='"ohcICN_" + index'></span>
            </div>
            <tree-view :data="file.patientJSON" :options="{maxDepth: 5, modifiable: false}"></tree-view>
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
          displayName: 'Process'
        },
        msg: 'Process',
        url: process.env.SYNTHEA_URL,
        fileList: [],
        file: {
          patientName: '',
          url: '',
          fileName: '',
          patientJSON: {}
        },
        processingFiles: false,
        workingOnIt: false,
        fileCount: '',
        displayFeedback: false,
        isOpSuccess: true,
        isSearchValid: true,
        OP_SUCCESS: true,
        OP_FAIL: false
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
      createPatients: async function (count) {
        const baseUrl = process.env.SYNTHEA_URL
        const url = baseUrl + 'synthea/synthea-run?population=' + count
        const self = this
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
                console.log(response)
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
          axios.get(url)
            .then(function (response) {
              console.log(response)
              if (response.data !== undefined && response.data.length > 0) {
                self.fileList = response.data
              }

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
        const baseUrl = process.env.SYNTHEA_URL
        const url = baseUrl + 'synthea/patient?fileName=' + file.fileName
        console.log(url)
        let fileData
        let self = this
        self.workingOnIt = true

        await axios.get(url)
          .then(function (response) {
            if (response.data !== undefined) {
              file.patientJSON = response.data
              fileData = response.data
            }
          })
          .catch(function (error) {
            console.log(error)
          })

        Vue.set(file, 'patientJSON', fileData)
        self.workingOnIt = false
      },
      sendToVista: async function (file, index) {
        const baseUrl = process.env.SYNTHEA_URL
        const url = baseUrl + 'synthea/vista-export?fileName=' + file.fileName
        const self = this
        self.workingOnIt = true
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
                processing = false
              }
              if (processing === false) {
                self.workingOnIt = false
              }
            })
            .catch(function (error) {
              console.log(error)
            })
        }
        await self.sendToOHC(file, index, icn)
      },
      sendToOHC: async function (file, index, icn) {
        const baseUrl = process.env.SYNTHEA_URL
        const url = baseUrl + 'synthea/ohc-export?icn=' + icn
        const self = this
        self.workingOnIt = true
        var instance = axios.create()

        // Override timeout default for the library
        // Now all requests will wait 2.5 seconds before timing out
        instance.timeout = 360000

        // {"vistaSuccess":true,"ohcSuccess":false,"error":null,"icn":"5123457820V116090"}
        let processing = true
        while (processing) {
          await instance.post(url)
            .then(function (response) {
              console.log(response)
              if (response !== undefined) {
                processing = false
                let id = 'ohcICN_' + index
                document.getElementById(id).innerHTML = response.data.icn
              }
              if (processing === false) {
                self.workingOnIt = false
              }
            })
            .catch(function (error) {
              console.log(error)
            })
        }
      }
    },
    beforeMount: function () {
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
    margin-top: 7px;
  }
</style>
