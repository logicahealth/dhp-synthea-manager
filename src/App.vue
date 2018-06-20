<template>
  <div id="app">
    <header>
      <div class="logo"></div>
    </header>
    <div class="dxc-menu-toggle">
      <button class="dxc-btn-menu" @click="toggleNav">
        <img class="menu" src="./assets/img/icon-menu.svg" alt="Menu" title="Toggle Side Menu">
      </button>
    </div>

    <div class="dxc-content-wrapper">
      <transition name="fade-menu" appear>
        <nav role="navigation" v-if="navigation">
          <h1>DHP Synthea Manager</h1>
          <div class="dxc-menu">
            <ul>
              <li v-for="item in navItems">
                <i class="material-icons">{{item.icon}}</i>
                <a :href="`#/${item.path}`">{{item.name}}</a>
              </li>
            </ul>
            <!--<div class="user">Hello, User</div>
            <a>Sign off</a>-->
          </div>
        </nav>
      </transition>

      <main>
        <router-view></router-view>
      </main>
    </div>

    <footer>
      <div class="title">
        Digital Health Platform
        <div class="subtitle">&#9400; 2018</div>
      </div>
      <!--<ul>
        <li><span>DHP Suite</span><a>About</a><a>Help</a><a>Contact Us</a></li>
        <li><span>Technology</span><a>How It Works</a><a>Features</a><a>Documentations</a></li>
        <li><span>Legal</span><a>Terms & Conditions</a><a>Privacy Policy</a></li>
      </ul>-->
    </footer>
  </div>
</template>

<script>
  export default {
    name: 'Process',
    data () {
      return {
        msg: 'Process',
        navItems: [
          { name: 'Process', path: 'Process', icon: 'build' }
        ],
        navigation: true
      }
    },
    methods: {
      onResize () {
        if (window.innerWidth <= 768) {
          this.navigation = false
        } else {
          this.navigation = true
        }
      },
      toggleNav () {
        this.navigation = !this.navigation
      }
    },
    created () {
      window.addEventListener('resize', this.onResize)
    },
    beforeMount () {
      this.id = this.$route.params.id
    },
    beforeDestroy () {
      window.removeEventListener('resize', this.onResize)
    }
  }
</script>

<style lang="scss">
  @import './assets/css/dhp';
  @import '~bulma/bulma';
</style>

