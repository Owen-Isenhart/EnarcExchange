// Manual Jest mock for @google/generative-ai
// Keeps unit tests fast and self-contained — no real API calls.

const GoogleGenerativeAI = jest.fn().mockImplementation(() => ({
  getGenerativeModel: jest.fn().mockReturnValue({
    generateContent: jest.fn().mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            markets: [],
            description: "Mock AI description",
          }),
      },
    }),
  }),
}));

module.exports = { GoogleGenerativeAI };