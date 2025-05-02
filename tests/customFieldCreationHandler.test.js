import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { createCustomFields } from "./your-module-path";

describe("createCustomFields", () => {
  let mockAxios: MockAdapter;
  const mockToken = "test-token-123";
  const mockObjectDefinition = {
    objectApiName: "TestObject__c",
    objectFields: [
      { name: "Field1", type: "Text" },
      { name: "Field2", type: "Number" }
    ]
  };

  beforeEach(() => {
    mockAxios = new MockAdapter(axios);
    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => mockToken);
  });

  afterEach(() => {
    mockAxios.restore();
    jest.clearAllMocks();
  });

  it("should make a POST request with correct data and headers", async () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost("http://localhost:5000/salesforce/createFields").reply(200, mockResponse);

    const response = await createCustomFields(mockObjectDefinition);

    expect(mockAxios.history.post.length).toBe(1);
    expect(mockAxios.history.post[0].url).toBe("http://localhost:5000/salesforce/createFields");
    expect(mockAxios.history.post[0].data).toEqual(
      JSON.stringify({
        fieldsData: {
          objectApiName: mockObjectDefinition.objectApiName,
          fields: mockObjectDefinition.objectFields
        }
      })
    );
    expect(mockAxios.history.post[0].headers).toEqual({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${mockToken}`
    });
    expect(response).toEqual({ data: mockResponse });
  });

  it("should return the response data on successful request", async () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost("http://localhost:5000/salesforce/createFields").reply(200, mockResponse);

    const response = await createCustomFields(mockObjectDefinition);
    expect(response).toEqual({ data: mockResponse });
  });

  it("should handle errors and log them to console", async () => {
    const errorMessage = "Network Error";
    mockAxios.onPost("http://localhost:5000/salesforce/createFields").networkError();
    
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    
    await createCustomFields(mockObjectDefinition);
    
    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    consoleSpy.mockRestore();
  });

  it("should include the auth token from localStorage", async () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost("http://localhost:5000/salesforce/createFields").reply(200, mockResponse);

    await createCustomFields(mockObjectDefinition);
    
    expect(localStorage.getItem).toHaveBeenCalledWith("AuthToken");
    expect(mockAxios.history.post[0].headers.Authorization).toBe(`Bearer ${mockToken}`);
  });

  it("should send the correct object structure in the request", async () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost("http://localhost:5000/salesforce/createFields").reply(200, mockResponse);

    await createCustomFields(mockObjectDefinition);
    
    const requestData = JSON.parse(mockAxios.history.post[0].data);
    expect(requestData.fieldsData.objectApiName).toBe(mockObjectDefinition.objectApiName);
    expect(requestData.fieldsData.fields).toEqual(mockObjectDefinition.objectFields);
  });
});