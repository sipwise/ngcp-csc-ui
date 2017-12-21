<template>
    <csc-page title="Always">
        <csc-destinations title="When I am online ..."
			:destinations="destinations.everyone.always.online">
        </csc-destinations>
        <csc-destinations title="When I am busy ..."
			:destinations="destinations.everyone.always.busy">
        </csc-destinations>
        <csc-destinations title="When I am offline ..."
			:destinations="destinations.everyone.always.offline">
        </csc-destinations>
    </csc-page>
</template>

<script>
    import CscPage from '../../CscPage'
    import CscDestinations from './CscDestinations'
    export default {
        data () {
            return {
				destinations: {
					everyone: {
						always: {
							online: [
								{ simple_destination: "1111", timeout: "300" },
								{ simple_destination: "2222", timeout: "300" },
								{ simple_destination: "3333", timeout: "300" },
								{ simple_destination: "4444", timeout: "300" }
							],
							busy: [
								{ simple_destination: "5555", timeout: "10" },
								{ simple_destination: "6666", timeout: "10" },
								{ simple_destination: "7777", timeout: "10" },
								{ simple_destination: "8888", timeout: "10" }
							],
							offline: [
								{ simple_destination: "9999", timeout: "30" },
								{ simple_destination: "0000", timeout: "30" }
							],
						},
						after_hours: {
						}
					},
					list_a: {
					}
				}
            }
        },
        components: {
            CscPage,
            CscDestinations
        }
    }
</script>

<style lang="stylus">
</style>
