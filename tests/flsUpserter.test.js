import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { upsertFls } from "./your-module-path";

describe("upsertFls", () => {
  let mockAxios: MockAdapter;
  const mockToken = "test-token-123";
  const mockMetadata = new Map([
    ["field1", { fieldName: "Field1__c", editable: true }],
    ["field2", { fieldName: "Field2__c", editable: false }]
  ]);

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
    mockAxios.onPost("http://localhost:5000/salesforce/fls/set").reply(200, mockResponse);

    const response = await upsertFls(mockMetadata);

    expect(mockAxios.history.post.length).toBe(1);
    expect(mockAxios.history.post[0].url).toBe("http://localhost:5000/salesforce/fls/set");
    expect(mockAxios.history.post[0].data).toEqual(
      JSON.stringify({
        data: {
          fls: Array.from(mockMetadata.values())
        }
      })
    );
    expect(mockAxios.history.post[0].headers).toEqual({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${mockToken}`
    });
    expect(response).toEqual({ data: mockResponse });
  });

  it("should convert Map values to array in request body", async () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost("http://localhost:5000/salesforce/fls/set").reply(200, mockResponse);

    await upsertFls(mockMetadata);
    
    const requestData = JSON.parse(mockAxios.history.post[0].data);
    expect(requestData.data.fls).toEqual(Array.from(mockMetadata.values()));
    expect(requestData.data.fls.length).toBe(2);
  });

  it("should include the auth token from localStorage", async () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost("http://localhost:5000/salesforce/fls/set").reply(200, mockResponse);

    await upsertFls(mockMetadata);
    
    expect(localStorage.getItem).toHaveBeenCalledWith("AuthToken");
    expect(mockAxios.history.post[0].headers.Authorization).toBe(`Bearer ${mockToken}`);
  });

  it("should return the axios response on success", async () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost("http://localhost:5000/salesforce/fls/set").reply(200, mockResponse);

    const result = await upsertFls(mockMetadata);
    expect(result).toEqual({ data: mockResponse });
  });

  it("should handle errors and log them to console", async () => {
    const errorMessage = "Network Error";
    mockAxios.onPost("http://localhost:5000/salesforce/fls/set").networkError();
    
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    
    const result = await upsertFls(mockMetadata);
    
    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    expect(result).toBeUndefined();
    consoleSpy.mockRestore();
  });

  it("should return undefined when the request fails", async () => {
    mockAxios.onPost("http://localhost:5000/salesforce/fls/set").reply(500);
    
    const result = await upsertFls(mockMetadata);
    expect(result).toBeUndefined();
  });
});