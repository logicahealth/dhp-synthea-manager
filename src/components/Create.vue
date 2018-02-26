<template>
  <div>
    <h1><span v-if="persona.id">Update</span><span v-else>Add</span> Persona</h1>

    <transition name="fade-menu" mode="out-in">
    <article v-if="displayFeedback" class="message" :class="isSuccessMessage">
      <div class="message-header">
        <p v-if="isOpSuccess">Success</p>
        <p v-else>Error</p>
        <button class="delete" aria-label="delete" @click="displayFeedback = false"></button>
      </div>
      <div class="message-body">
        <p v-if="isOpSuccess">Persona has been saved successfully.</p>
        <p v-else>Error in saving Persona. Please try again later.</p>
      </div>
    </article>
    </transition>

    <section>
      <div class="container notification is-fluid">
        <h2>Persona Details</h2>
        <form>
          <!-- first row -->
          <div class="columns">
            <div class="column is-3 field">
              <label for="personaId">ID</label>
              <div class="control">
                <input class="input" id="personaId" v-model="persona.id" placeholder="ID">
            </div>
            </div>
            <div class="column is-3 field">
              <label for="personaLastName">Last Name</label>
              <div class="control">
                <input class="input" id="personaLastName" v-model="persona.lastName" placeholder="LAST NAME">
              </div>
            </div>
            <div class="column is-3 field">
              <label for="personaFirstName">First Name</label>
              <div class="control">
                <input class="input" id="personaFirstName" v-model="persona.firstName" placeholder="FIRST NAME">
              </div>
            </div>
          </div>

          <!-- Second row -->
          <div class="columns">
            <div class="column is-3 field">
              <label for="personaSSN">SSN</label>
              <div class="control">
                <input class="input" id="personaSSN" v-model="persona.ssn" placeholder="SSN">
              </div>
            </div>
            <div class="column is-3 field">
              <label for="birthDate">Date of Birth</label>
              <div class="control">
                <input class="input" id="birthDate" v-model="persona.birthDate" placeholder="YYYY-MM-DD">
              </div>
            </div>
            <div class="column is-3 field">
              <label for="personaGender">Gender</label>
              <div class="control">
                <input class="input" id="personaGender" v-model="persona.gender" placeholder="GENDER">
              </div>
            </div>
          </div>

          <!-- Third row -->
          <div class="columns">
            <div class="column is-3 field">
              <label for="personaStreet">Street</label>
              <div class="control">
                <input class="input" id="personaStreet" v-model="persona.street" placeholder="STREET">
              </div>
            </div>
            <div class="column is-3 field">
              <label for="personaCity">City</label>
              <div class="control">
                <input class="input" id="personaCity" v-model="persona.city" placeholder="CITY">
              </div>
            </div>
            <div class="column is-3 field">
              <label for="personaState">State</label>
              <div class="control">
                <input class="input" id="personaState" v-model="persona.state" placeholder="STATE">
              </div>
            </div>
            <div class="column is-3 field">
              <label for="personaPostalCode">Postal Code</label>
              <div class="control">
                <input class="input" id="personaPostalCode" v-model="persona.postalCode" placeholder="ZIP CODE">
              </div>
            </div>
          </div>
          <button class="dxc-btn-primary" v-on:click.prevent="createPersona"><span v-if="persona.id">Update</span><span v-else>Add</span></button>
          <button class="dxc-btn-secondary" v-on:click="clearPersona">Clear</button>
        </form>

        <div class="subtitle">Patients Assigned to Persona</div>
        <div class="dxc-table-wrapper">
          <table class="table is-striped is-narrow is-hoverable">
            <thead>
              <tr>
              <th>ID</th>
              <th>Last Name</th>
              <th>First Name</th>
              <th>DOB</th>
              <th>Gender</th>
              <th>Postal Code</th>
              <th>Source</th>
              <th>Action</th>
            </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in persona.patients">
                <td>
                  <a target="_blank" :href='url + item.id + urlSource'
                     :title="`Launch ${item.lastName}, ${item.firstName}'s Patient Viewer`">{{item.id}}</a>
                </td>
                <td>{{item.lastName}}</td>
                <td>{{item.firstName}}</td>
                <td>{{item.birthDate | formatDate}}</td>
                <td>{{item.gender}}</td>
                <td>{{item.postalCode}}</td>
                <td>{{item.source}}</td>
                <td>
                  <button class="dxc-btn-link" v-on:click="removePatient(index)" title="Unassign patient">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section>
      <div class="container notification is-fluid">
        <h2>Search Patients to Assign to Persona</h2>
        <form>
          <div class="columns">
            <div class="column is-3 field">
              <label for="id">Patient ID</label>
              <div class="control">
                <input class="input" :class="isErrorControl" id="id" v-model="patientSearch.id" placeholder="PATIENT ID" @change="clearSearchError">
              </div>
            </div>
            <div class="column is-3 field">
              <label for="lastName">Last Name</label>
              <div class="control">
                <input class="input" :class="isErrorControl" id="lastName" v-model="patientSearch.lastName" placeholder="LAST NAME" @change="clearSearchError">
              </div>
            </div>
            <div class="column is-3 field">
              <label for="firstName">First Name</label>
              <div class="control">
                <input class="input" :class="isErrorControl" id="firstName" v-model="patientSearch.firstName" placeholder="FIRST NAME" @change="clearSearchError">
              </div>
            </div>
          </div>

          <div class="columns">
            <div class="column is-3 field">
              <label for="beginAge">Age Range From</label>
              <div class="control">
                <input class="input" :class="isErrorControl" id="beginAge" v-model="patientSearch.beginAge" placeholder="BEGINNING AGE" @change="clearSearchError">
              </div>
            </div>
            <div class="column is-3 field">
              <label for="endAge">Age Range To</label>
              <div class="control">
                <input class="input" :class="isErrorControl" id="endAge" v-model="patientSearch.endAge" placeholder="ENDING AGE" @change="clearSearchError">
              </div>
            </div>
            <div class="column is-3 field">
              <label for="gender">Gender</label>
              <div class="control">
                <input class="input" :class="isErrorControl" id="gender" v-model="patientSearch.gender" placeholder="GENDER" @change="clearSearchError">
              </div>
            </div>
          </div>

          <div class="columns">
            <div class="column is-3 field">
              <label for="postalCode">Postal Code</label>
              <div class="control">
                <input class="input" :class="isErrorControl" id="postalCode" v-model="patientSearch.postalCode" placeholder="POSTAL CODE" @change="clearSearchError">
              </div>
            </div>
            <div class="column is-3 field">
              <label for="source">Source</label>
              <div class="control">
                <span class="select">
                  <select :class="isErrorControl" id="source" v-model="patientSearch.source" @change="clearSearchError">
                    <option value="">Select an option</option>
                    <option value="Cerner">Cerner</option>
                    <option value="OHC">OHC</option>
                    <option value="SyntheticMass">SyntheticMass</option>
                    <option value="VistA">VistA</option>
                  </select>
                </span>
              </div>
            </div>
            <div class="column is-3 field">
              <label for="condition">Condition</label>
              <div class="control">
                <input class="input" id="condition" v-model="patientSearch.condition" placeholder="CONDITION" disabled>
              </div>
            </div>
          </div>
          <p id="searchError" class="help is-danger hide">Require at least one search criterion.</p>
          <button class="dxc-btn-primary" v-on:click.prevent="findPatients">Search</button>
          <button class="dxc-btn-secondary" v-on:click="clearSearch">Clear</button>
        </form>

        <div class="subtitle">Search Results</div>
        <div class="dxc-table-wrapper">
          <table class="table is-striped is-narrow is-hoverable">
            <thead>
              <tr>
                <th>ID</th>
                <th>Last Name</th>
                <th>First Name</th>
                <th>DOB</th>
                <th>Gender</th>
                <th>Postal Code</th>
                <th>Source</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in patientResults">
                <td>
                  <a target="_blank" :href='url + item.id + urlSource'
                    :title="`Launch ${item.lastName}, ${item.firstName}'s Patient Viewer`">{{item.id}}</a>
                </td>
                <td>{{item.lastName}}</td>
                <td>{{item.firstName}}</td>
                <td>{{item.birthDate | formatDate}}</td>
                <td>{{item.gender}}</td>
                <td>{{item.postalCode}}</td>
                <td>{{item.source}}</td>
                <td>
                  <button class="dxc-btn-link" v-on:click="addPatient(item)" title="Assign patient">Assign</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <span> {{view.searchResults}}</span>
      </div>
    </section>
  </div>
</template>

<script>
  import Vue from 'vue'
  import axios from 'axios'
  import moment from 'moment'

  export default {
    name: 'Patient',
    data: function () {
      return {
        view: {
          header: 'Loading...',
          searchResults: '',
          bundles: [],
          bundleName: 'Patient',
          displayName: 'Persona'
        },
        url: process.env.EHR_URL + 'patient/',
        urlSource: '?source=ohc',
        persona: {
          id: '2345',
          firstName: '',
          lastName: '',
          ssn: '',
          birthDate: '',
          gender: '',
          street: '',
          city: '',
          state: '',
          postalCode: '',
          source: 'OHC',
          identifiers: [],
          patients: []
        },
        patientResults: [],
        patientSearch: {
          id: '',
          firstName: '',
          lastName: '',
          beginAge: '',
          endAge: '',
          gender: '',
          postalCode: '',
          source: '',
          condition: ''
        },
        patientSearchValues: [],
        displayFeedback: false,
        isOpSuccess: true,
        isSearchValid: true,
        OP_SUCCESS: true,
        OP_FAIL: false
      }
    },
    created () {
      this.persona = {}
      this.persona = this.$store.state.persona
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
      clearSearchError () {
        document.getElementById('searchError').classList.replace('show', 'hide')
        this.isSearchValid = true
      },
      showSearchError () {
        document.getElementById('searchError').classList.replace('hide', 'show')
        this.isSearchValid = false
      },
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
      clearSearch: function () {
        this.clearSearchError()
        this.patientSearch = {}
        this.patientResults = []
      },
      clearPersona: function () {
        this.persona = {}
        this.patientResults = []
      },
      findPatients: function () {
        this.patientResults = []
        let view = this.view
        view.searchResults = 'Searching...'

        const baseUrl = process.env.FHIR_URL
        let url = baseUrl + 'Patient'

        var temp = {}
        var searchCriteria = {}

        if (this.patientSearch.id !== 'undefined' && this.patientSearch.id !== '') {
          temp.id = this.patientSearch.id
        }

        if (this.patientSearch.firstName !== 'undefined' && this.patientSearch.firstName !== '') {
          temp.given = this.patientSearch.firstName
        }

        if (this.patientSearch.lastName !== 'undefined' && this.patientSearch.lastName !== '') {
          temp.family = this.patientSearch.lastName
        }

        if (this.patientSearch.gender !== 'undefined' && this.patientSearch.gender !== '') {
          temp.gender = this.patientSearch.gender
        }

        searchCriteria = Object.keys(temp).map(function (key) {
          return key + '=' + temp[key]
        }).join('&')

        if (this.patientSearch.postalCode !== '') {
          if (searchCriteria !== undefined && searchCriteria.length > 0) {
            searchCriteria = searchCriteria + '&'
          }
          searchCriteria = searchCriteria + 'address.postalCode=' + this.patientSearch.postalCode
        }

        if (this.patientSearch.source !== '') {
          if (searchCriteria !== undefined && searchCriteria.length > 0) {
            // searchCriteria = searchCriteria + '&source=' + this.patientSearch.source
            searchCriteria = searchCriteria + '&'
          }
          searchCriteria = searchCriteria + 'meta.tag.display=' + this.patientSearch.source
        }

        if (this.patientSearch.beginAge !== '') {
          if (searchCriteria !== undefined && searchCriteria.length > 0) {
            searchCriteria = searchCriteria + '&'
          }
          let beginDOB = calculateDOB(this.patientSearch.beginAge)
          console.log(beginDOB)
          searchCriteria = searchCriteria + 'birthDate=le' + beginDOB
        }

        if (this.patientSearch.endAge !== '') {
          if (searchCriteria !== undefined && searchCriteria.length > 0) {
            searchCriteria = searchCriteria + '&'
          }
          let endDOB = calculateDOB(this.patientSearch.endAge)
          console.log(endDOB)
          searchCriteria = searchCriteria + 'birthDate=ge' + endDOB
        }

        console.log('searchCriteria:  ' + searchCriteria)
        if (searchCriteria !== '' && searchCriteria.length > 0) {
          url = url + '?' + searchCriteria.toString()
        } else {
          // alert('search criteria required')
          this.showSearchError()
          return
        }

        console.log('url:  ' + url)

        axios.get(url)
          .then(function (response) {
            console.log(response)
            if (response.data.entry !== undefined) {
              response.data.entry.forEach(function (bundle) {
                console.log(bundle)
                console.log(bundle.resource)
                mapPatientResult(bundle.resource)
                view.searchResults = ''
              })
            } else {
              view.searchResults = 'No patients records found.'
            }
          })
          .catch(function (error) {
            if (error.message !== undefined && error.message === 'Network Error') {
              view.searchResults = 'Request has timed-out - try to narrow your search criteria'
            } else {
              console.log(error)
              view.searchResults = 'Error loading results - reload page'
            }
          })

        let results = this.patientResults

        function calculateDOB (age) {
          let birthDate = moment().subtract(age, 'years').calendar()
          birthDate = moment(birthDate, 'MM-DD-YYYY').format('YYYY-MM-DD')
          return birthDate
        }

        function mapPatientResult (resource) {
          let patient = Vue.formatPatient(resource)
          results.push(patient)
        }
      },
      addPatient: function (item) {
        // add to id to Patient Persona identifiers
        this.persona.patients.push(item)
      },
      removePatient (index) {
        if (index > -1) {
          this.persona.patients.splice(index, 1)
        }
      },
      createPersona: function () {
        const self = this
        const baseUrl = process.env.FHIR_URL
        const processBaseURL = process.env.FHIR_PROCESS_URL
        const url = baseUrl + 'Patient/' + this.persona.id
        let persona = this.persona
        // let view = this.view
        persona.source = 'OHC'
        createIdentifiers(persona, processBaseURL)
        axios({
          method: 'put',
          url: url,
          data: {
            resourceType: 'Patient',
            id: persona.id,
            meta: {
              tag: [
                {
                  display: persona.source
                }
              ]
            },
            identifier: persona.identifiers,
            name: [
              {
                use: 'official',
                family: persona.lastName,
                given: [
                  persona.firstName
                ]
              }
            ],
            gender: persona.gender,
            birthDate: persona.birthDate,
            address: [
              {
                line: [
                  persona.street
                ],
                city: persona.city,
                state: persona.state,
                postalCode: persona.postalCode
              }
            ]
          }
        })
          .then(function () {
            // alert('Persona Saved Successfully')
            self.showMessageBox(self.OP_SUCCESS)
          })
          .catch(function (error) {
            console.log(error)
            // view.header = 'Error saving Persona'
            self.showMessageBox(self.OP_FAIL)
          })

        function createIdentifiers (persona, processBaseURL) {
          // OHC Identifier for Persona Patient
          persona.identifiers = []
          // Persona Identifier:  Source is being mapped to system for OHC and other identifiers
          const personaIdentifier = {
            system: persona.source,
            value: persona.id
          }
          persona.identifiers.push(personaIdentifier)

          // SSN for Persona Patient
          const personaSSN = {
            type: {
              coding: [
                {
                  system: 'http://hl7.org/fhir/identifier-type',
                  code: 'SB'
                }
              ]
            },
            system: 'http://hl7.org/fhir/sid/us-ssn',
            value: persona.ssn
          }
          persona.identifiers.push(personaSSN)
          // Patients to be associated to the Persona
          for (let i = 0; i < persona.patients.length; i++) {
            axios.get(processBaseURL, {
              params: {
                id: persona.patients[i].id
              }
            }).then(function (response) {
              console.log(response)
            }).catch(function (error) {
              console.log(error)
            })
            const identifier = {
              type: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                    code: 'MR'
                  }
                ]
              },
              system: persona.patients[i].source,
              value: persona.patients[i].id
            }
            persona.identifiers.push(identifier)
          }
        }
      }
    }
  }

</script>

<style lang="scss">
  .help {
    font-size: 1rem;
    margin: -12px 0 12px 0;
  }
  .hide {
    display: none;
  }
  .show {
    animation: fade-in-error 0.5s ease-in forwards;
    // animation-iteration-count: 3;
  }
  @keyframes fade-in-error {
    0% { opacity: 0; }
    100% { opacity: 100; }
  }
  @media screen and (min-width: 1024px) {
    .message {
      margin-left: 32px;
      margin-right: 32px;
    }
  }
</style>
