<template>
  <div>
    <h1>Synthea Process</h1>

    <details>
      <summary class="columns" v-on:click="populateFileList()">
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
        <div v-for="file in fileList" class="columns">
          <div class="subtitle column is-3" v-if="fileList.length > 0">Created Files:</div>
          <div class="column is-3">
          <button class="dxc-btn-link em" v-on:click="sendToVista(fileList)">Send all files to Vista</button>
          </div>
        </div>
        <div v-for="file in fileList" class="columns">
          <div class="column is-3">
            <a href="">file name</a>
            <tree-view :data="jsonSource" :options="{maxDepth: 5}"></tree-view>
          </div>
          <div class="column is-3">
            <button class="dxc-btn-link em" v-on:click="sendToVista(file)">Send to Vista</button>
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
        fileList: [{name: 'file_name'}],
        jsonSource: {bundle: 'patient', identifier: [{id: 1234, source: 'theSource'}]},
        processingFiles: false,
        fileCount: ''
      }
    },
    components: {
      Stretch
    },
    methods: {
      createFiles: function (count) {
        const baseUrl = process.env.SYNTHEA_URL
        const url = baseUrl + 'synthea/create?population=' + count
        this.processingFiles = true
        axios.get(url)
          .then(function (response) {
            let processStatus = true
            while (processStatus) {
              processStatus = this.checkProcessStatus()
            }
          })
          .catch(function (error) {
            console.log(error)
          })
      },
      checkProcessStatus: function () {
        const baseUrl = process.env.SYNTHEA_URL
        const url = baseUrl + 'synthea/checkprocess'
        let processingFiles = this.processingFiles
        axios.get(url)
          .then(function (response) {
            if (response.running !== undefined && response.running === 'false') {
              processingFiles = false
            }
          })
          .catch(function (error) {
            console.log(error)
          })
        return processingFiles
      },
      getPatientFiles: function () {  // LIst of Patients to display
        const baseUrl = process.env.SYNTHEA_URL
        const url = baseUrl + 'synthea/patientFiles'

        axios.get(url)
          .then(function (response) {
            if (response.files !== undefined && response.files.length > 0) {
              this.fileList = response.files
            }
          })
          .catch(function (error) {
            console.log(error)
          })
      },
      getPatient: function () { //  is this the json file for the patient?
        const baseUrl = process.env.SYNTHEA_URL
        const url = baseUrl + 'synthea/patient'  // ??Rob need to provide endpoint

        axios.get(url)
          .then(function (response) {
            if (response.files !== undefined && response.files.length > 0) {
              this.fileList = response.files
            }
          })
          .catch(function (error) {
            console.log(error)
          })
      },
      sendToVista: function (files) {
        const baseUrl = process.env.SYNTHEA_URL
        const url = baseUrl + 'synthea/processPatientFiles'
        let view = this.files

        return axios.post(url)
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
