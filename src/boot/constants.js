// Export constants for direct import
export const faxQualityOptions = [
    {
        label: 'Normal',
        value: 'normal'
    },
    {
        label: 'Fine',
        value: 'fine'
    },
    {
        label: 'Super',
        value: 'super'
    }
]

export const faxQualityOptionsDefault = faxQualityOptions[0]

export default ({ app }) => {
    // Create reactive constants with i18n
    const constants = {
        faxQualityOptions: [
            {
                get label () {
                    return app.config.globalProperties.$t('Normal')
                },
                value: 'normal'
            },
            {
                get label () {
                    return app.config.globalProperties.$t('Fine')
                },
                value: 'fine'
            },
            {
                get label () {
                    return app.config.globalProperties.$t('Super')
                },
                value: 'super'
            }
        ],
        faxQualityOptionsDefault: null // Initialize as null first
    }

    // Set default after object is created
    constants.faxQualityOptionsDefault = constants.faxQualityOptions[0]

    // Add to global properties for Options API
    app.config.globalProperties.$faxQualityOptions = constants.faxQualityOptions
    app.config.globalProperties.$faxQualityOptionsDefault = constants.faxQualityOptionsDefault

    // Provide for Composition API
    app.provide('constants', constants)
}
