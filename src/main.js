// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VeeValidate from 'vee-validate'
import Vuex from 'vuex'
import moment from 'moment'
import axios from 'axios'
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'

// globally (in your main .js file)
Vue.component('icon', Icon)

Vue.config.productionTip = false
Vue.use(VeeValidate)
Vue.use(Vuex)

Vue.filter('formatDate', function (value) {
  if (value) {
    return moment(String(value)).format('MM/DD/YYYY')
  }
})

Vue.filter('formatDateTime', function (value) {
  if (value) {
    return moment(String(value)).format('MM/DD/YYYY h:mm A')
  }
})

Vue.filter('formatUrl', function (value, id) {
  if (value) {
    return '/#/Patient/' + id + '/' + value
  }
})

Vue.filter('formatSystem', function (value) {
  if (value) {
    return getSystem(value)
  }
})

Vue.filter('formatCode', function (value) {
  if (value) {
    return getCode(value)
  }
})

Vue.filter('formatDisplay', function (value) {
  if (value) {
    return getDisplay(value)
  }
})

const desiredSystem = 'SNOMED'

const systemCodes = [
  { uri: 'http://snomed.info/sct', code: desiredSystem },
  { uri: 'http://snomed.info/', code: desiredSystem },
  { uri: 'http://hl7.org/fhir/sid/icd-9-cm', code: 'ICN-9' },
  { uri: 'http://hl7.org/fhir/sid/icd-10-cm', code: 'ICD-10' },
  { uri: 'http://loinc.org', code: 'LOINC' },
  { uri: 'http://www.ama-assn.org/go/cpt', code: 'CPT' },
  { uri: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: 'RxNorm' },
  { uri: 'http://hl7.org/fhir/ndfrt', code: 'NDF-RT' },
  { uri: 'http://hl7.org/fhir/condition-category', code: 'FHIR' },
  { uri: 'http://hl7.org/fhir/sid/cvx', code: 'CVX' }
]

const bpCodes = ['8480-6', '8462-4']

function getSystem (code) {
  if (code === undefined || code.coding === undefined) {
    return ' '
  }
  let system = ' '
  let bpSkip = false
  for (let i = 0; i < code.coding.length; i++) {
    if (system === desiredSystem || bpSkip) {
      continue
    }
    let index = systemCodes.findIndex(system => system.uri === code.coding[i].system)
    if (index !== -1) {
      system = systemCodes[index].code
    }
    index = bpCodes.indexOf(code.coding[i].code)
    if (index !== -1) {
      bpSkip = true
    }
  }
  return system
}

function formatPatient (resource) {
  console.log('formatPatient: resource id: ' + resource.id)
  let info = {}
  info.id = resource.id
  info.lastName = resource.name[0].family
  info.firstName = resource.name[0].given[0]
  info.birthDate = resource.birthDate
  info.gender = resource.gender
  info.identifiers = []
  for (let i = 0; i < resource.identifier.length; i++) {
    if (resource.identifier[i].type !== undefined) {
      if (resource.identifier[i].type.coding[0].code === 'SB') {
        info.ssn = resource.identifier[i].value
      } else {
        if (resource.identifier[i].system !== undefined) {
          const identifier = {
            // Source is being mapped to system for OHC and other identifiers)
            typeCodingSystem: resource.identifier[i].type.coding[0].system,
            typeCodingCode: resource.identifier[i].type.coding[0].code,
            system: resource.identifier[i].system,
            value: resource.identifier[i].value
          }
          info.identifiers.push(identifier)
        }
      }
    }
  }
  info.source = resource.meta.tag[0].display
  info.street = ''
  if (resource.address !== undefined) {
    if (resource.address[0].line !== undefined && resource.address[0].line[0] !== undefined) {
      info.street = resource.address[0].line[0]
    }
    if (resource.address[0].city !== undefined) {
      info.city = resource.address[0].city
    }
    if (resource.address[0].state !== undefined) {
      info.state = resource.address[0].state
    }
    if (resource.address[0].postalCode !== undefined) {
      info.postalCode = resource.address[0].postalCode
    }
  }
  console.log('formatPatient: info id: ' + info.id)
  return info
}

function findPatientByIdentifier (identifier) {
  console.log('findPatientByIdentifier: identifier: system ' + identifier.system + ' value: ' + identifier.value)
  const baseUrl = process.env.FHIR_URL
  const url = baseUrl + 'Patient?id=' + identifier.value + '&meta.tag.display=' + identifier.system
  axios.get(url)
    .then(function (response) {
      console.log(response)
      if (response.data.entry !== undefined) {
        response.data.entry.forEach(function (bundle) {
          let patient = Vue.formatPatient(bundle.resource)
          console.log('patient id: ' + patient.id)
          return patient
        })
      }
    })
    .catch(function (error) {
      console.log(error)
    })
}

function getCode (code) {
  if (code === undefined || code.coding === undefined) {
    return ' '
  }
  let system = ' '
  let codeItem = ' '
  let bpSkip = false
  for (let i = 0; i < code.coding.length; i++) {
    if (system === desiredSystem || bpSkip) {
      continue
    }
    let index = systemCodes.findIndex(system => system.uri === code.coding[i].system)
    if (index !== -1) {
      system = systemCodes[index].code
      codeItem = code.coding[i].code
    }
    index = bpCodes.indexOf(code.coding[i].code)
    if (index !== -1) {
      bpSkip = true
    }
  }
  return codeItem
}

function getDisplay (code) {
  if (code === undefined || code.coding === undefined) {
    return ' '
  }
  let system = ' '
  let display = ''
  let bpSkip = false
  for (let i = 0; i < code.coding.length; i++) {
    if (system === desiredSystem || bpSkip) {
      continue
    }
    let index = systemCodes.findIndex(system => system.uri === code.coding[i].system)
    if (index !== -1) {
      system = systemCodes[index].code
      if (code.coding[i].display !== undefined) {
        display = code.coding[i].display
      }
    }
    index = bpCodes.indexOf(code.coding[i].code)
    if (index !== -1) {
      bpSkip = true
    }
  }
  return display
}

const DhPlugin = {
  install (Vue) {
    Vue.getSystem = function (resource) {
      return getSystem(resource)
    }
    Vue.formatPatient = function (resource) {
      return formatPatient(resource)
    }
    Vue.findPatientByIdentifier = function (identifier) {
      return findPatientByIdentifier(identifier)
    }
    Vue.getCode = function (code) {
      return getCode(code)
    }
    Vue.getDisplay = function (code) {
      return getDisplay(code)
    }
    Vue.getBundleFromApi = function (id, view, sortFunction) {
      const baseUrl = process.env.BASE_URL
      const url = baseUrl + view.bundleName
      const config = {
        headers: {'Authorization': 'Organization/1'}
      }
      axios.get(url, config)
        .then(function (response) {
          if (response.data.entry !== undefined) {
            response.data.entry.forEach(function (bundle) {
              if (bundle.resource.resourceType === view.bundleName) {
                view.bundles.push(bundle)
              }
            })
            view.header = view.displayName
          } else {
            view.header = 'No ' + view.displayName + ' records found for patient'
          }
          if (sortFunction !== undefined) {
            view.bundles.sort(sortFunction)
          }
        })
        .catch(function (error) {
          console.log(url)
          console.log(error)
          if (error.response.status !== undefined && error.response.status === 404) {
            view.header = 'No ' + view.displayName + ' records found for patient'
          } else {
            if (error.response !== undefined) {
              console.log(error.response)
            }
            console.log(error)
          }
        })
    }
  }
}

Vue.use(DhPlugin)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  // store,
  template: '<App/>',
  components: { App }
})
