<template>
  <q-dialog v-model="ShowAlert" :position="Position">
    <q-card :class="BgClass">
      <q-card-section>
        <span>{{ Message }}</span>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: "AlertDialog",
  props: ['ShowAlert', 'Position', 'BgClass', 'Message'],
}
</script>

<style scoped>

</style>
