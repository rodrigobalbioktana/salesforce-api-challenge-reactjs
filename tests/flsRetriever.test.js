import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { retrieveProfilesAndPermSets } from "../src/impl/flsRetriever.ts";

describe("retrieveProfilesAndPermSets", () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axios);
  });

  afterEach(() => {
    mockAxios.restore();
    jest.clearAllMocks();
  });

  it("should make a GET request to the correct endpoint", async () => {
    const mockResponse = { data: ["Profile1", "Profile2"] };
    mockAxios.onGet("http://localhost:5000/salesforce/fls/get").reply(200, mockResponse);

    await retrieveProfilesAndPermSets();

    expect(mockAxios.history.get.length).toBe(1);
    expect(mockAxios.history.get[0].url).toBe("http://localhost:5000/salesforce/fls/get");
  });

  it("should return the response data on successful request", async () => {
    const mockResponse = { data: ["Profile1", "Profile2", "PermSet1"] };
    mockAxios.onGet("http://localhost:5000/salesforce/fls/get").reply(200, mockResponse);

    const result = await retrieveProfilesAndPermSets();
    expect(result).toEqual(mockResponse.data);
  });

  it("should handle errors and log them to console", async () => {
    const errorMessage = "Network Error";
    mockAxios.onGet("http://localhost:5000/salesforce/fls/get").networkError();
    
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    
    await retrieveProfilesAndPermSets();
    
    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    consoleSpy.mockRestore();
  });

  it("should return undefined when the request fails", async () => {
    mockAxios.onGet("http://localhost:5000/salesforce/fls/get").reply(500);
    
    const result = await retrieveProfilesAndPermSets();
    expect(result).toBeUndefined();
  });

  it("should not include any request body in the GET call", async () => {
    const mockResponse = { data: ["Profile1"] };
    mockAxios.onGet("http://localhost:5000/salesforce/fls/get").reply(200, mockResponse);

    await retrieveProfilesAndPermSets();
    
    expect(mockAxios.history.get[0].data).toBeUndefined();
  });
});