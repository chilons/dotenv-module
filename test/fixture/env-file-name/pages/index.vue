<template>
  <div>
    foo: {{ foo }}
    bar: {{ bar }}
  </div>
</template>

<script>
export default {
  data () {
    return {
      foo: process.env.foo,
      bar: process.env.bar
    }
  }
}
</script>
