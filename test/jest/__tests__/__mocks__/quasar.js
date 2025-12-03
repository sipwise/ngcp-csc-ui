const mockPlatform = {
  is: {
    mobile: false,
    desktop: true,
    android: false,
    ios: false,
    cordova: false
  }
}

export const Platform = mockPlatform

// Export a function to reset/update the mock
export const __setPlatform = (config) => {
  mockPlatform.is = { ...config }
}

export default {
  Platform
}
