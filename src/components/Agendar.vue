<template>
        <div class="no-padding" >
              <StepperRealizarAgendamentos/>
        </div>
</template>

<script>
import StepperRealizarAgendamentos from "components/StepperRealizarAgendamentos";

export default {
  name: "Agendar",
  components: {StepperRealizarAgendamentos}
}
</script>

<style scoped>
.my-card{
  height: 100%;
}
</style>
