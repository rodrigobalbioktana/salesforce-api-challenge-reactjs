const request = require('supertest');
const app = require('./server');
const jsforce = require('jsforce');

// Mock the jsforce module
jest.mock('jsforce');

describe('Salesforce OAuth Server', () => {
  let mockConnection;
  let mockOAuth2;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Create mock implementations
    mockConnection = {
      authorize: jest.fn(),
      metadata: {
        create: jest.fn(),
        list: jest.fn(),
        read: jest.fn(),
        update: jest.fn()
      },
      describe: jest.fn()
    };
    
    mockOAuth2 = {
      getAuthorizationUrl: jest.fn()
    };
    
    // Setup mock returns
    jsforce.Connection.mockImplementation(() => mockConnection);
    jsforce.OAuth2.mockImplementation(() => mockOAuth2);
  });

  afterAll(() => {
    app.close();
  });

  describe('OAuth Endpoints', () => {
    test('GET /oauth/auth should redirect to Salesforce', async () => {
      mockOAuth2.getAuthorizationUrl.mockReturnValue('https://login.salesforce.com/auth');
      
      const response = await request(app)
        .get('/oauth/auth')
        .expect(302);
      
      expect(response.header.location).toBe('https://login.salesforce.com/auth');
    });

    test('GET /oauth/callback should handle successful auth', async () => {
      const mockUserInfo = {
        id: 'testUserId',
        url: 'https://test.salesforce.com'
      };
      
      mockConnection.authorize.mockResolvedValue(mockUserInfo);
      mockConnection.accessToken = 'testAccessToken1234567890';
      mockConnection.instanceUrl = 'https://test.salesforce.com';
      
      const response = await request(app)
        .get('/oauth/callback?code=auth_code')
        .expect(200);
      
      expect(response.text).toContain('Auth Success');
      expect(response.text).toContain('testUserId');
      expect(response.text).toContain('testAccessToken123');
    });

    test('GET /oauth/callback should handle missing auth code', async () => {
      const response = await request(app)
        .get('/oauth/callback')
        .expect(400);
      
      expect(response.text).toBe('Auth code missing');
    });
  });

  describe('Metadata Endpoints', () => {
    test('POST /salesforce/createObject should create custom object', async () => {
      const mockObject = {
        objectDefinition: {
          fullName: 'TestObject__c',
          label: 'Test Object'
        }
      };
      
      mockConnection.metadata.create.mockResolvedValue({ success: true });
      
      const response = await request(app)
        .post('/salesforce/createObject')
        .send(mockObject)
        .expect(200);
      
      expect(mockConnection.metadata.create).toHaveBeenCalledWith(
        'CustomObject',
        mockObject.objectDefinition
      );
      expect(response.body).toEqual({ success: true });
    });

    test('POST /salesforce/createFields should create fields', async () => {
      const mockFields = {
        fieldsData: {
          objectApiName: 'TestObject__c',
          fields: [
            {
              fieldApiName: 'TestField',
              fieldLabel: 'Test Field',
              dataType: 'Text',
              required: true
            }
          ]
        }
      };
      
      mockConnection.metadata.create.mockResolvedValue({ success: true });
      
      const response = await request(app)
        .post('/salesforce/createFields')
        .send(mockFields)
        .expect(200);
      
      expect(mockConnection.metadata.create).toHaveBeenCalledWith(
        'CustomField',
        expect.objectContaining({
          fullName: 'TestObject__c.TestField__c',
          label: 'Test Field',
          type: 'Text'
        })
      );
    });

    test('POST /salesforce/createFields should handle picklist fields', async () => {
      const mockFields = {
        fieldsData: {
          objectApiName: 'TestObject__c',
          fields: [
            {
              fieldApiName: 'Status',
              fieldLabel: 'Status',
              dataType: 'Picklist',
              picklistOptions: ['Open', 'Closed']
            }
          ]
        }
      };
      
      mockConnection.metadata.create.mockResolvedValue({ success: true });
      
      await request(app)
        .post('/salesforce/createFields')
        .send(mockFields);
      
      expect(mockConnection.metadata.create).toHaveBeenCalledWith(
        'CustomField',
        expect.objectContaining({
          type: 'Picklist',
          valueSet: {
            valueSetDefinition: {
              value: [
                { fullName: 'Open', default: false, label: 'Open', isActive: true },
                { fullName: 'Closed', default: false, label: 'Closed', isActive: true }
              ]
            }
          }
        })
      );
    });
  });

  describe('Field Level Security Endpoints', () => {
    test('GET /salesforce/fls/get should return profiles and permission sets', async () => {
      const mockPermSets = [{ fullName: 'TestPermSet' }];
      const mockProfiles = [{ fullName: 'Standard User' }];
      
      mockConnection.metadata.list
        .mockResolvedValueOnce(mockPermSets)
        .mockResolvedValueOnce(mockProfiles);
      
      const response = await request(app)
        .get('/salesforce/fls/get')
        .expect(200);
      
      expect(response.body).toEqual({
        permissionSets: mockPermSets,
        profiles: mockProfiles
      });
    });

    test('POST /salesforce/fls/set should update field permissions', async () => {
      const mockRequest = {
        data: {
          fls: [
            {
              fullName: 'Account.TestField__c',
              fieldPermissions: [
                {
                  metadataType: 'Profile',
                  name: 'Standard User',
                  editable: true,
                  readable: true
                }
              ]
            }
          ]
        }
      };
      
      const mockProfile = {
        fieldPermissions: []
      };
      
      mockConnection.metadata.read.mockResolvedValue(mockProfile);
      mockConnection.metadata.update.mockResolvedValue({ success: true });
      
      const response = await request(app)
        .post('/salesforce/fls/set')
        .send(mockRequest)
        .expect(200);
      
      expect(mockConnection.metadata.read).toHaveBeenCalledWith(
        'Profile',
        'Standard User'
      );
      expect(mockConnection.metadata.update).toHaveBeenCalledWith(
        'Profile',
        expect.objectContaining({
          fieldPermissions: [
            {
              field: 'Account.TestField__c',
              editable: true,
              readable: true
            }
          ]
        })
      );
    });
  });

  describe('Error Handling', () => {
    test('should handle metadata creation errors', async () => {
      const mockObject = {
        objectDefinition: {
          fullName: 'TestObject__c',
          label: 'Test Object'
        }
      };
      
      mockConnection.metadata.create.mockRejectedValue(new Error('Creation failed'));
      
      const response = await request(app)
        .post('/salesforce/createObject')
        .send(mockObject)
        .expect(500);
      
      expect(response.text).toBe('Creation failed');
    });
  });
});