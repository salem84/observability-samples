<template>
 <div class="main">
  <h3>Prime Vue Client</h3>

  <form class="form" >
    <input class="input" v-model="num" type="text" name="name" placeholder="Check number" />
    <br />
    <button class="submit-button" @click="handleCheck">Check</button>
    <br/>
    <div v-show="showResult"> 
      <div v-show="isPrime">Number is <span class="result-sucess">prime</span></div>
      <div v-show="!isPrime">Number is <span class="result-wrong">not prime</span></div>
    </div>
    
  </form>
  </div>
</template>

<script>
import axios from "axios";
import { traceSpan } from "./tracing";

export default {
  name: "App",
  data() {
    return {
      num: null,
      showResult: false,
      isPrime: null
    };
  },
  async mounted() {
    
  },
  methods: {
    async checkNumber() {
      const response = await axios.get("https://httpbin.org/get", {

      });
      // this.todos.push(response.data);
      // this.title = "";
      // this.description = "";
      console.log(response.status);
      this.showResult = true;
      this.isPrime = false;
    },

    async handleCheck(e){
      e.preventDefault();
      if(this.num) {
        //await traceSpan("checkNumber", this.checkNumber);
        await this.checkNumber();
      }
    },
   
  }
};
</script>

<style>
.main {
  margin: auto;
  margin-top: 3rem;
  max-width: 400px;
}
.form {
  display: flex;
  flex-direction: column;
  align-items: center;
}
h3{
  font-size: 22px;
  font-weight: bold;
  text-align: center;
}

.input {
  width: 100%;
  padding: 10px;
}

.submit-button {
  width: 400px;
  padding: 10px;
  background-color: #1976d2;
  color: white;
  cursor: pointer;
}

.result-sucess {
  font-weight: bold;
  text-transform: uppercase;
  color:green
}
.result-wrong {
  font-weight: bold;
  text-transform: uppercase;
  color:red;
}
</style>