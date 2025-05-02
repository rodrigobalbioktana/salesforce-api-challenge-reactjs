import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { createNewObject } from "../src/impl/objectCreationHandler.ts";

describe("createNewObject", () => {
  let mockAxios: MockAdapter;
  const mockToken = "test-token-123";
  const mockObjectDefinition = {
    objectApiName: "TestObject__c",
    objectLabel: "Test Object"
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

  it("should make a POST request with correct data structure", async () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost("http://localhost:5000/salesforce/createObject").reply(200, mockResponse);

    await createNewObject(mockObjectDefinition);

    expect(mockAxios.history.post.length).toBe(1);
    expect(mockAxios.history.post[0].url).toBe("http://localhost:5000/salesforce/createObject");
    
    const expectedData = {
      objectDefinition: {
        fullName: mockObjectDefinition.objectApiName,
        label: mockObjectDefinition.objectLabel,
        pluralLabel: mockObjectDefinition.objectLabel + 's',
        nameField: {
          type: 'Text',
          label: 'Name'
        },
        deploymentStatus: 'Deployed',
        sharingModel: "ReadWrite",
        description: 'Description'
      }
    };
    
    expect(JSON.parse(mockAxios.history.post[0].data)).toEqual(expectedData);
  });

  it("should include correct headers with auth token", async () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost("http://localhost:5000/salesforce/createObject").reply(200, mockResponse);

    await createNewObject(mockObjectDefinition);
    
    expect(mockAxios.history.post[0].headers).toEqual({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${mockToken}`
    });
    expect(localStorage.getItem).toHaveBeenCalledWith("AuthToken");
  });

  it("should return the response on success", async () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost("http://localhost:5000/salesforce/createObject").reply(200, mockResponse);

    const result = await createNewObject(mockObjectDefinition);
    expect(result).toEqual({ data: mockResponse });
  });

  it("should handle errors and log them to console", async () => {
    const errorMessage = "Network Error";
    mockAxios.onPost("http://localhost:5000/salesforce/createObject").networkError();
    
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    
    const result = await createNewObject(mockObjectDefinition);
    
    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    expect(result).toBeUndefined();
    consoleSpy.mockRestore();
  });

  it("should generate pluralLabel by adding 's' to objectLabel", async () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost("http://localhost:5000/salesforce/createObject").reply(200, mockResponse);

    await createNewObject(mockObjectDefinition);
    
    const requestData = JSON.parse(mockAxios.history.post[0].data);
    expect(requestData.objectDefinition.pluralLabel).toBe(`${mockObjectDefinition.objectLabel}s`);
  });

  it("should return undefined when the request fails", async () => {
    mockAxios.onPost("http://localhost:5000/salesforce/createObject").reply(500);
    
    const result = await createNewObject(mockObjectDefinition);
    expect(result).toBeUndefined();
  });

  it("should use default values for static fields", async () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost("http://localhost:5000/salesforce/createObject").reply(200, mockResponse);

    await createNewObject(mockObjectDefinition);
    
    const requestData = JSON.parse(mockAxios.history.post[0].data);
    expect(requestData.objectDefinition.nameField).toEqual({
      type: 'Text',
      label: 'Name'
    });
    expect(requestData.objectDefinition.deploymentStatus).toBe('Deployed');
    expect(requestData.objectDefinition.sharingModel).toBe('ReadWrite');
    expect(requestData.objectDefinition.description).toBe('Description');
  });
});