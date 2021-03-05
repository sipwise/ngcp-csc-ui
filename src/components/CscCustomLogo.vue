<template>
    <div>
        <q-img
            :src="logoData"
            alt="Logo"
        />
    </div>
</template>

<script>
export default {
    name: 'CscCustomLogo',
    props: {
        logoData: {
            type: String,
            default: ''
        }
    }
}
</script>
