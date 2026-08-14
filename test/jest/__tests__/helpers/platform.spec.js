// Jest will automatically use the mock from test/jest/__mocks__/quasar.js
import { __setPlatform } from 'quasar'
import { getPlatform, isDesktop, isMobile } from 'src/helpers/platform'

describe('Platform Helpers', () => {
    beforeEach(() => {
        // Reset Platform mock before each test
        __setPlatform({
            mobile: false,
            desktop: true,
            android: false,
            ios: false,
            cordova: false
        })
    })

    describe('isMobile', () => {
        it('should return true when platform is mobile', () => {
            __setPlatform({
                mobile: true,
                desktop: false,
                android: false,
                ios: false,
                cordova: false
            })

            expect(isMobile()).toBe(true)
        })

        it('should return false when platform is not mobile', () => {
            __setPlatform({
                mobile: false,
                desktop: true,
                android: false,
                ios: false,
                cordova: false
            })

            expect(isMobile()).toBe(false)
        })

        it('should reflect real-time changes to Platform', () => {
            __setPlatform({
                mobile: false,
                desktop: true,
                android: false,
                ios: false,
                cordova: false
            })
            expect(isMobile()).toBe(false)

            __setPlatform({
                mobile: true,
                desktop: false,
                android: false,
                ios: false,
                cordova: false
            })
            expect(isMobile()).toBe(true)
        })
    })

    describe('isDesktop', () => {
        it('should return true when platform is desktop', () => {
            __setPlatform({
                mobile: false,
                desktop: true,
                android: false,
                ios: false,
                cordova: false
            })

            expect(isDesktop()).toBe(true)
        })

        it('should return false when platform is not desktop', () => {
            __setPlatform({
                mobile: false,
                desktop: false,
                android: false,
                ios: false,
                cordova: false
            })

            expect(isDesktop()).toBe(false)
        })

        it('should reflect real-time changes to Platform', () => {
            __setPlatform({
                mobile: false,
                desktop: true,
                android: false,
                ios: false,
                cordova: false
            })
            expect(isDesktop()).toBe(true)

            __setPlatform({
                mobile: false,
                desktop: false,
                android: false,
                ios: false,
                cordova: false
            })
            expect(isDesktop()).toBe(false)
        })
    })

    describe('getPlatform', () => {
        it('should return all platform properties', () => {
            const platform = getPlatform()

            expect(platform).toHaveProperty('isMobile')
            expect(platform).toHaveProperty('isDesktop')
            expect(platform).toHaveProperty('isAndroid')
            expect(platform).toHaveProperty('isIOS')
            expect(platform).toHaveProperty('isCordova')
        })

        it('should return correct values for desktop', () => {
            __setPlatform({
                mobile: false,
                desktop: true,
                android: false,
                ios: false,
                cordova: false
            })

            const platform = getPlatform()

            expect(platform.isMobile).toBe(false)
            expect(platform.isDesktop).toBe(true)
            expect(platform.isAndroid).toBe(false)
            expect(platform.isIOS).toBe(false)
            expect(platform.isCordova).toBe(false)
        })

        it('should return correct values for Android mobile', () => {
            __setPlatform({
                mobile: true,
                desktop: false,
                android: true,
                ios: false,
                cordova: false
            })

            const platform = getPlatform()

            expect(platform.isMobile).toBe(true)
            expect(platform.isDesktop).toBe(false)
            expect(platform.isAndroid).toBe(true)
            expect(platform.isIOS).toBe(false)
            expect(platform.isCordova).toBe(false)
        })

        it('should return correct values for iOS mobile', () => {
            __setPlatform({
                mobile: true,
                desktop: false,
                android: false,
                ios: true,
                cordova: false
            })

            const platform = getPlatform()

            expect(platform.isMobile).toBe(true)
            expect(platform.isDesktop).toBe(false)
            expect(platform.isAndroid).toBe(false)
            expect(platform.isIOS).toBe(true)
            expect(platform.isCordova).toBe(false)
        })

        it('should return correct values for Cordova app', () => {
            __setPlatform({
                mobile: true,
                desktop: false,
                android: true,
                ios: false,
                cordova: true
            })

            const platform = getPlatform()

            expect(platform.isMobile).toBe(true)
            expect(platform.isDesktop).toBe(false)
            expect(platform.isAndroid).toBe(true)
            expect(platform.isIOS).toBe(false)
            expect(platform.isCordova).toBe(true)
        })

        it('should return a new object on each call', () => {
            const platform1 = getPlatform()
            const platform2 = getPlatform()

            expect(platform1).not.toBe(platform2)
            expect(platform1).toEqual(platform2)
        })
    })

    describe('Integration Tests', () => {
        it('should correctly identify desktop environment', () => {
            __setPlatform({
                mobile: false,
                desktop: true,
                android: false,
                ios: false,
                cordova: false
            })

            expect(isMobile()).toBe(false)
            expect(isDesktop()).toBe(true)

            const platform = getPlatform()
            expect(platform.isDesktop).toBe(true)
            expect(platform.isMobile).toBe(false)
        })

        it('should correctly identify mobile environment', () => {
            __setPlatform({
                mobile: true,
                desktop: false,
                android: true,
                ios: false,
                cordova: false
            })

            expect(isMobile()).toBe(true)
            expect(isDesktop()).toBe(false)

            const platform = getPlatform()
            expect(platform.isMobile).toBe(true)
            expect(platform.isDesktop).toBe(false)
            expect(platform.isAndroid).toBe(true)
        })

        it('should handle platform switching scenarios', () => {
            // Start as desktop
            __setPlatform({
                mobile: false,
                desktop: true,
                android: false,
                ios: false,
                cordova: false
            })
            expect(isDesktop()).toBe(true)
            expect(isMobile()).toBe(false)

            // Switch to mobile
            __setPlatform({
                mobile: true,
                desktop: false,
                android: false,
                ios: false,
                cordova: false
            })
            expect(isDesktop()).toBe(false)
            expect(isMobile()).toBe(true)
        })
    })

    describe('Type Consistency', () => {
        it('isMobile should always return boolean', () => {
            __setPlatform({ mobile: true, desktop: false, android: false, ios: false, cordova: false })
            expect(typeof isMobile()).toBe('boolean')

            __setPlatform({ mobile: false, desktop: true, android: false, ios: false, cordova: false })
            expect(typeof isMobile()).toBe('boolean')
        })

        it('isDesktop should always return boolean', () => {
            __setPlatform({ mobile: false, desktop: true, android: false, ios: false, cordova: false })
            expect(typeof isDesktop()).toBe('boolean')

            __setPlatform({ mobile: true, desktop: false, android: false, ios: false, cordova: false })
            expect(typeof isDesktop()).toBe('boolean')
        })

        it('getPlatform should always return object with boolean values', () => {
            const platform = getPlatform()

            expect(typeof platform).toBe('object')
            expect(typeof platform.isMobile).toBe('boolean')
            expect(typeof platform.isDesktop).toBe('boolean')
            expect(typeof platform.isAndroid).toBe('boolean')
            expect(typeof platform.isIOS).toBe('boolean')
            expect(typeof platform.isCordova).toBe('boolean')
        })
    })

    describe('Edge Cases', () => {
        it('should handle when both mobile and desktop are false', () => {
            __setPlatform({
                mobile: false,
                desktop: false,
                android: false,
                ios: false,
                cordova: false
            })

            expect(isMobile()).toBe(false)
            expect(isDesktop()).toBe(false)

            const platform = getPlatform()
            expect(platform.isMobile).toBe(false)
            expect(platform.isDesktop).toBe(false)
        })

        it('should handle when both mobile and desktop are true', () => {
            __setPlatform({
                mobile: true,
                desktop: true,
                android: false,
                ios: false,
                cordova: false
            })

            expect(isMobile()).toBe(true)
            expect(isDesktop()).toBe(true)
        })
    })
})
