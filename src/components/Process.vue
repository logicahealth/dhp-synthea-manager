<template>
  <div>
    <h1>Synthea Process</h1>

    <details>
      <summary class="columns">
        <div class="column is-4">
          <label for="fileCount"># of files to create</label>
          <input v-model='fileCount' id="fileCount" class="" >
        </div>
        <div class="column is-3">
          <button class="dxc-btn-link em" v-on:click="createPatients(fileCount)">Create Patients</button>
        </div>
        <div class="column is-3">
          <stretch  background="#202020" v-if="processingFiles === true"></stretch>
        </div>
      </summary>

      <div class="dxc-details-content">
        <div class="columns">
          <div class="subtitle column is-3">Created Files:</div>
        </div>
        <div v-for="(file, index) in fileList" class="columns">
          <div class="column is-12">
            <a v-on:click="getPatient(file, index)">{{file.patientName}}</a>
            <button class="dxc-btn-link em" v-on:click="sendToVista(file)">Send to Vista</button>
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
        fileCount: ''
      }
    },
    components: {
      Stretch
    },
    methods: {
      createPatients: async function (count) {
        const baseUrl = process.env.SYNTHEA_URL
        const url = baseUrl + 'synthea/create?population=' + count
        const self = this
        self.processingFiles = true

        axios.get(url)
          .then(function (response) {
            console.log(response)
            checkProcessStatus()
          })
          .catch(function (error) {
            console.log(error)
          })

        async function checkProcessStatus () {
          const baseUrl = process.env.SYNTHEA_URL
          const url = baseUrl + 'synthea/checkProcess'
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
              })
          }
        }
        function getPatientFiles (self) {
          // LIst of Patients to display
          const baseUrl = process.env.SYNTHEA_URL
          const url = baseUrl + 'synthea/patientFiles'
          axios.get(url)
            .then(function (response) {
              console.log(response)
              if (response.data !== undefined && response.data.length > 0) {
                self.fileList = response.data
              }
            })
            .catch(function (error) {
              console.log(error)
            })
        }
      },
      getPatient: function (file, index) {
        // LIst of Patients to display
        const baseUrl = process.env.SYNTHEA_URL
        const url = baseUrl + 'synthea/patient?fileName=' + file.fileName
        console.log(url)
        let fileData
        axios.get(url)
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
      },
      sendToVista: function (file) {
        const baseUrl = process.env.SYNTHEA_URL
        const url = baseUrl + 'synthea/processPatientFiles?fileName=' + file.fileName
        let view = this.files

        return axios.get(url)
          .then(function (response) {
            if (response.data.entry !== undefined) {
              for (let i = 0; i < response.data.entry.length; i++) {

              }
            } else {
              view.header = 'No ' + view.displayName + ' records found for patient'
            }
          })
          .catch(function (error) {
            console.log(error)
          })
      }
    },
    beforeMount: function () {
    }
  }
</script>
