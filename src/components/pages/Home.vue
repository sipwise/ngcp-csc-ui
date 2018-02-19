<template>
    <csc-page :title="$t('pages.home.title')">
		<div class="row md-gutter">
			<div class="col-lg-4 col-md-6 col-sm-6 col-xs-6">
                <div @click="call()">
                    <q-card :class="{ 'home-card-inactive': !isCallAvailable,
                        'home-card-active': isCallAvailable }"
                        class="no-margin"
                        flat>
						<q-card-main align="center">
							<q-icon size="6rem" name="call" class="home-icons" />
						</q-card-main>
						<q-card-actions align="center">
							{{ $t('pages.home.cards.voiceCall') }}
						</q-card-actions>
					</q-card>
				</div>
			</div>
			<div class="col-lg-4 col-md-6 col-sm-6 col-xs-6">
                <div @click="call()">
                    <q-card :class="{ 'home-card-inactive': !isCallAvailable,
                        'home-card-active': isCallAvailable }"
                        class="no-margin"
                        flat>
						<q-card-main align="center">
							<q-icon size="6rem" name="video call" class="home-icons" />
						</q-card-main>
						<q-card-actions align="center">
							{{ $t('pages.home.cards.videoCall') }}
						</q-card-actions>
					</q-card>
				</div>
			</div>
			<div class="col-lg-4 col-md-6 col-sm-6 col-xs-6">
                <div @click="call()">
                    <q-card :class="{ 'home-card-inactive': !isCallAvailable,
                        'home-card-active': isCallAvailable }"
                        class="no-margin"
                        flat>
						<q-card-main align="center">
							<q-icon size="6rem" name="screen share" class="home-icons" />
						</q-card-main>
						<q-card-actions align="center">
							{{ $t('pages.home.cards.screenShare') }}
						</q-card-actions>
					</q-card>
				</div>
			</div>
			<div class="col-lg-4 col-md-6 col-sm-6 col-xs-6">
				<router-link to="/user/call-forward/always">
					<q-card class="home-card-active no-margin" flat>
						<q-card-main align="center">
							<q-icon size="6rem" name="phone forwarded" class="home-icons" />
						</q-card-main>
						<q-card-actions align="center">
							{{ $t('pages.home.cards.callForward') }}
						</q-card-actions>
					</q-card>
				</router-link>
			</div>
			<div class="col-lg-4 col-md-6 col-sm-6 col-xs-6">
				<router-link to="/user/call-blocking/incoming">
					<q-card class="home-card-active no-margin" flat>
						<q-card-main align="center">
							<q-icon size="6rem" name="block" class="home-icons" />
						</q-card-main>
						<q-card-actions align="center">
							{{ $t('pages.home.cards.callBlocking') }}
						</q-card-actions>
					</q-card>
				</router-link>
			</div>
			<div class="col-lg-4 col-md-6 col-sm-6 col-xs-6">
				<router-link to="/user/reminder">
					<q-card class="home-card-active no-margin" flat>
						<q-card-main align="center">
							<q-icon size="6rem" name="alarm" class="home-icons" />
						</q-card-main>
						<q-card-actions align="center">
							{{ $t('pages.home.cards.reminder') }}
						</q-card-actions>
					</q-card>
				</router-link>
			</div>
			<div class="col-lg-4 col-md-6 col-sm-6 col-xs-6">
				<q-card class="home-card-inactive no-margin" flat>
					<q-card-main align="center">
						<q-icon size="6rem" name="contacts" class="home-icons" />
					</q-card-main>
					<q-card-actions align="center">
						{{ $t('pages.home.cards.buddyList') }}
					</q-card-actions>
				</q-card>
			</div>
		</div>
    </csc-page>
</template>

<script>
    import CscPage from '../CscPage'
    import CscCall from '../CscCall'
    import { mapGetters } from 'vuex'
    import { QCard, QCardMain, QCardActions,
    QCardMedia, QIcon } from 'quasar-framework'
    export default {
        data() {
            return {
            }
        },
        components: {
            CscPage,
            CscCall,
            QCard,
            QCardMain,
            QCardActions,
			QCardMedia,
            QIcon
        },
        computed: {
            ...mapGetters('call', [
                'isCallAvailable'
            ])
        },
        methods: {
            call() {
                this.$store.commit('layout/showRight');
                //this.$store.dispatch('call/initialize');
            }
        }
    }
</script>

<style lang="stylus">
@import '~variables'
    .q-card-actions
        font-size 22px
        padding 0 10px 35px 10px
    .home-card-active
        border solid 2px $primary
        .home-icons
            color $primary
        .q-card-actions
            color $primary
    .home-card-inactive
        cursor not-allowed
        border solid 2px $grey
        .home-icons
            color $grey
        .q-card-actions
            color $grey
</style>
