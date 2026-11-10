import { expect } from '@playwright/test';


/**
 * AuthHelper provides authentication and user management utilities
 * using Playwright API request contexts and environment configuration.
 */
class AuthHelper {

  /**
   * Initialize the API helper with a Playwright request context.
   * @param {import('@playwright/test').APIRequestContext} request - Playwright API request object.
   */
  constructor(request) {
    this.request = request;
    this.userId = this.userId;
  }


  /**
   * Retrieve an OAuth access token from the identity provider.
   * Uses configured grant type, client credentials, and audience values.
   * @returns {Promise<string>} Access token string.
   * @throws {Error} When token retrieval or parsing fails.
   */
 async getAccessToken() {
  try {

    console.log("========== REQUESTING ACCESS TOKEN ==========");
    const client_id = process.env[`client_id_${process.env.environment}`];
    const client_secret = process.env[`client_secret_${process.env.environment}`];
  //  console.log("Client ID:", client_id);
  //  console.log("Client Secret:", client_secret);
    const formData = new URLSearchParams();
    formData.append('grant_type', process.env.grant_type);
    formData.append('client_id', client_id);
    formData.append('client_secret', client_secret);

    formData.append(
      'audience',
      process.env.audience_initial +
      process.env.environment +
      process.env.audience_final
    );

    const response = await this.request.post(
      process.env.base_url_iam_initial +
      process.env.environment +
      process.env.base_url_iam_final,
      {
        headers: {
          'Content-Type': 'application/json'
        },

        data: JSON.stringify(Object.fromEntries(formData))
      }
    );

    console.log("========== RESPONSE ==========");
    console.log("STATUS:", response.status());
   // console.log("HEADERS:", JSON.stringify(response.headers()));
   // console.log("Response Body:", await response.text());
    const responseBody = await response.text();

    console.log(
      "RESPONSE BODY:",
      JSON.stringify(
        JSON.parse(responseBody),
        null,
        2
      )
    );
    expect(response.status()).toBe(200);
    const jsonResponse = JSON.parse(responseBody);
    const access_token = jsonResponse.access_token;
    if (!access_token) {
      throw new Error('Access token not found in response');
    }
    return access_token;
  } catch (error) {
    console.error("Token Error:", error);
    throw new Error(`Access token retrieval failed: ${error.message}`);
  }
}

  /**
   * Create a new user in the target user management system.
   * @param {string} projectID - Project identifier to assign to the new user.
   * @param {string} postalCode - Postal code value for the user profile.
   * @returns {Promise<string>} Created user ID.
   * @throws {Error} When user creation fails.
   */
  async createNewUser(projectID, postalCode) {
    try {
      const response = await this.request.post(process.env.user_management_url, {
        headers: {
          'Authorization': 'Bearer ' + (await this.getAccessToken())
        },
        data: {
          "displayName": "test_userSmoke",
          "givenName": "Smoke",
          "surname": "TestUser04",
          "postalCode": postalCode,
          "identities": [
            {
              "signInType": "emailAddress",
              "issuer": "masterbrandadb2c.onmicrosoft.com",
              "issuerAssignedId": process.env.createEmail
            }
          ],
          "otherMails": [
            process.env.createEmail
          ],
          "passwordProfile": {
            "password": process.env.password,
            "forceChangePasswordNextSignIn": false
          },
          "passwordPolicies": "DisablePasswordExpiration",
          "extension_90990c67bdf64febbc10a5df4945246e_ProjectId": projectID,
          "extension_90990c67bdf64febbc10a5df4945246e_Environment": "DEV"
        }
      });
      console.log("response body:" + await JSON.stringify(response));
      expect(response.status()).toBe(201);
      const { id } = await response.json();
      return id;
    } catch (error) {
      throw new Error(`create failed: ${error.message}`);
    }
  }

  /**
   * Retrieve the Auth0 user ID for a given email address.
   * @param {string} email - Email address to search for.
   * @returns {Promise<string|false>} User ID if found, otherwise false.
   */
  async getUserByEmail(email) {
    const encodedEmail = encodeURIComponent(email);

    const response = await this.request.get(
      process.env.audience_initial +
      process.env.environment +
      process.env.audience_final +
      "users?q=" + encodedEmail + "&search_engine=v3",
      {
        headers: {
          'Authorization': 'Bearer ' + (await this.getAccessToken())
        },
      }
    );

    expect(response.status()).toBe(200);

    const userId = await response.json();

    if (userId[0] && userId[0].user_id) {
      console.log("Get ID by email: " + userId[0].user_id);
      return userId[0].user_id;
    } else {
      return false;
    }
  }

  /**
 * Retrieve all Auth0 user IDs matching a given email pattern.
 * @param {string} email - Email address or pattern to search for.
 * @returns {Promise<string[]>} Array of user IDs if found, otherwise empty array.
 */
async getUsersByEmailAll(email) {
  
  const response = await this.request.get(
    process.env.audience_initial +
    process.env.environment +
    process.env.audience_final +
    "users?q=email:" + email + "*+OR+email.domain:" + email + "*&search_engine=v3&page=0&per_page=100",
    {
      headers: {
        'Authorization': 'Bearer ' + (await this.getAccessToken())
      },
    }
  );

  expect(response.status()).toBe(200);

  const users = await response.json();

  if (!users || users.length === 0) {
    console.log("No users found for email pattern: " + email);
    return [];
  }

  const userIds = users
    .filter(user => user && user.user_id)
    .map(user => {
      console.log("Found user ID: " + user.user_id);
      return user.user_id;
    });

  console.log(`Total users found: ${userIds.length}`);
  return userIds;
}

  /**
   * Fetch user details by email and return the corresponding Auth0 user ID.
   * @param {string} email - Email address used to locate the user.
   * @returns {Promise<string|false>} User ID if found, otherwise false.
   */
  async getUserById(email) {
    // Step 1: Get the Auth0 user_id via getUserByEmail
    const auth0UserId = await this.getUserByEmail(email);

    if (!auth0UserId) {
      console.log("No user found for email: " + email);
      return false;
    }

    const response = await this.request.get(
      process.env.audience_initial +
      process.env.environment +
      process.env.audience_final +
      "users/" + auth0UserId,
      {
        headers: {
          'Authorization': 'Bearer ' + (await this.getAccessToken())
        },
      }
    );

    expect(response.status()).toBe(200);

    const userDetails = await response.json();

    if (userDetails && userDetails.user_id) {
      console.log("Get full user by ID: " + userDetails.user_id);
      return userDetails.user_id;
    } else {
      return false;
    }
  }
  /**
   * Delete an existing Auth0 user by user ID.
   * @param {string} id - The Auth0 user ID to delete.
   * @returns {Promise<void>}
   * @throws {Error} When deletion fails.
   */
  async deleteExistingUser(id) {
    try {
      const response = await this.request.delete(
        process.env.audience_initial +
        process.env.environment +
        process.env.audience_final +
        "users/" + id, {
        headers: {
          'Authorization': 'Bearer ' + (await this.getAccessToken())
        },

      });

      expect(response.status()).toBe(204);
      console.log("User ID is deleted successfully:" + id);

    } catch (error) {
      throw new Error(`Delete Id  failed: ${error.message}`);
    }
  }

  /**
   * Delete a user from the separate user details service.
   * First obtains an anonymous session token, then removes the user.
   * @param {string} userId - User identifier for deletion.
   * @returns {Promise<void>}
   */
  async deleteUserFromUserDetails(userId) {
    // Step 1: POST to get anonymous session token
    const sessionResponse = await this.request.post(
        'https://api.low.digitalmbd.net/' + process.env.environment + '/user/api/Session/anonymous',
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );

    expect(sessionResponse.status()).toBe(200);
    const sessionBody = await sessionResponse.json();
    const userDetailsToken = sessionBody.token;
    // Step 2: DELETE user using the token from Step 1
    const deleteResponse = await this.request.delete(
        'https://api.low.digitalmbd.net/' + process.env.environment + '/user/' + userId,
        {
            headers: {
                'Authorization': 'Bearer ' + userDetailsToken
            }
        }
    );

    expect([204, 404, 500]).toContain(deleteResponse.status());
    console.log('User deleted from UserDetails, userId:', userId);
}

  /**
   * Create a new Azure Test Run from a list of point IDs and return the run ID.
   * @param {Map<any, any>} homePagePointsTCMap - Map containing point IDs for the test suite.
   * @param {string} planId - Azure Test Plan ID.
   * @param {string} suiteName - Name for the test suite.
   * @returns {Promise<number>} New Azure test run ID.
   */
  async getPointsIDforTestPlanTestSuite(homePagePointsTCMap, planId, suiteName) {
    console.log("Inside Test Result Report Creation");
    const now = new Date();
    const utcString = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}` + `T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}Z`;
    function pad(num) {
      return num.toString().padStart(2, '0');
    }
    const pointsIDList = Array.from(homePagePointsTCMap.keys());
    // console.log("List:"+pointsIDList);
    const response = await this.request.post('https://dev.azure.com/MBCIBI/Digital%20Product%20and%20Innovation/_apis/test/runs?api-version=7.1', {
      headers: {
        'Authorization': `Basic ${Buffer.from(`:${process.env.pat}`).toString('base64')}`
      },
      data: {
        "name": " Playwright_TestPlan_Update_" + suiteName + "_" + utcString,
        "plan": { "id": planId },
        "pointIds": pointsIDList

      }
    });
    console.log("response" + response.text());
    expect(response.status()).toBe(200);

    const { id } = await response.json();
    console.log("new test run id:" + id);
    return id;
  }

  /**
   * Update a specific test result in Azure DevOps with the provided status.
   * @param {string} runId - Azure test run ID.
   * @param {string} patchId - Result ID to patch.
   * @param {string} tcId - Test case ID.
   * @param {string} testStatus - Outcome status for the test result.
   * @returns {Promise<void>}
   */
  async patchRequest(runId, patchId, tcId, testStatus) {
    const response = await this.request.patch('https://dev.azure.com/MBCIBI/Digital%20Product%20and%20Innovation/_apis/test/Runs/' + runId + '/results?api-version=7.1', {
      headers: {
        'Authorization': `Basic ${Buffer.from(`:${process.env.pat}`).toString('base64')}`
      },
      data: [
        {
          "id": patchId,
          "testRun": {
            "id": '"' + runId + '"',
            "name": "Playwright JUnit Results",
            "url": "https://dev.azure.com/MBCIBI/Digital%20Product%20and%20Innovation/_apis/test/Runs/" + runId + '"'
          },
          "automatedTestType": "JUnit",
          "testCaseId": tcId,
          "outcome": testStatus,
          "state": "Completed",
          "comment": "Test Run From API",
          "durationInMs": 10000
        }
      ]
    });
    //console.log("response" + response.text());
    expect(response.status()).toBe(200);
  }

  /**
   * Mark an Azure DevOps test run as completed.
   * @param {string} runId - Azure test run ID.
   * @returns {Promise<void>}
   */
  async patchToCompleteTestRunRequest(runId) {
    const response = await this.request.patch('https://dev.azure.com/MBCIBI/Digital%20Product%20and%20Innovation/_apis/test/Runs/' + runId + '?api-version=7.1', {
      headers: {
        'Authorization': `Basic ${Buffer.from(`:${process.env.pat}`).toString('base64')}`
      },
      data: {
        "state": "Completed"
      }
    });
    expect(response.status()).toBe(200);
  }

  async updateProjectProfileAPIIDToDefault(projectID, userID) {
  const environment = process.env.environment || 'uat';
  const baseUrl = `https://api.`+process.env.environment+`.digitalmbd.net`;
  const url = `${baseUrl}/projectprofile/v1/projects/${projectID}`;

  const requestBody = {
    id: projectID,
    userId: userID,
    interviews: {
      icebreaker: {
        id: "2ef6204a-8e1d-48aa-b7fb-01416a57f276",
        isCompleted: false,
        completedOn: null
      },
      stylePersonality: {
        id: "9e5150f7-2483-4f85-a784-789297e4c9bb",
        isCompleted: false,
        completedOn: null
      },
      styleFinder: {
        id: "313bac32-57eb-4f84-b33a-eed36f8fbe97",
        isCompleted: false,
        completedOn: null
      },
      styleImageAnalyzer: {
        id: "810a20cf-3e2e-4235-a579-9e12d003e194",
        isCompleted: false,
        completedOn: null
      },
      styleTuner: {
        id: "00000000-0000-0000-0000-000000000000",
        isCompleted: false,
        completedOn: null
      },
      styleProfileFavorites: {
        id: "4077db96-f7a4-4730-9ceb-e73012db9b79",
        isCompleted: false,
        completedOn: null
      },
      designIntro: {
        id: "a95d9c39-7d86-450f-937c-ec78b2f58b07",
        isCompleted: false,
        completedOn: null
      },
      designActivities: {
        id: "64155f03-1e5c-45e6-9438-c42976807add",
        isCompleted: false,
        completedOn: null
      },
      storageSolutionFavorites: {
        id: "dd442368-98b3-4aa3-b2e3-5e666e441f07",
        isCompleted: false,
        completedOn: null
      },
      designCabinetTypes: {
        id: "0de0259b-7d7f-4672-b6e0-5028da323871",
        isCompleted: false,
        completedOn: null
      },
      budget: {
        id: "dbbc27d3-ca70-4dfc-b25c-fa2001a984a0",
        isCompleted: false,
        completedOn: null
      },
      startingBudget: {
        id: "interview__starting_budget",
        codeName: null,
        isCompleted: false,
        completedOn: null
      },
      itemizedBudget: {
        id: "interview__itemized_budget",
        codeName: null,
        isCompleted: false,
        completedOn: null
      }
    },
    profileContentType: "application/json",
    profile: {
      lastVisitedPath: null,
      remodelProfileCompleted: false,
      selectedStyle: null,
      selectedArchetype: null
    },
    uploads: null,
    metadata: null,
    feedback: {
      id: "00000000-0000-0000-0000-000000000000",
      projectId: projectID,
      rating: 0,
      comment: null,
      created: null
    },
    dealerShares: [],
    flowId: null,
    visualizerServiceEmailSentOn: null,
    matchmakerReadyOnUtc: null,
    profileCompletedOnUtc: null,
    showroomCode: null,
    showroomMatchType: "Unrestricted",
    showroomAssigned: null,
    readinessScore: 0,
    postalCode: null
  };

  const response = await this.request.put(url, {
    headers: {
      'Content-Type': 'application/json'
    },
    data: requestBody
  });

  expect(response.status()).toBe(200);
}

  async updateInterviewAPIIDsToDefault(projectID) {
  const baseUrl = `https://api.` + process.env.environment + `.digitalmbd.net`;

  // 1. Icebreaker Interview
  const icebreakerResponse = await this.request.put(
    `${baseUrl}/interview/v1/interviews/2ef6204a-8e1d-48aa-b7fb-01416a57f276/Responses?optionalProjectId=${projectID}`,
    {
      headers: { 'Content-Type': 'application/json' },
      data: {
        id: "2ef6204a-8e1d-48aa-b7fb-01416a57f276",
        questions: {
          "213db880-1284-46d7-999b-264822c31274": {
            answers: {
              "7fabec79-730a-4f25-8588-12f6ec4d62b1": false,
              "6db65eed-4a67-4f55-b84d-394c007df27b": false,
              "d99544c0-c900-4a9d-a6e3-5ab24c1f64bb": false,
              "20f68a1f-ff0c-4ffb-8a3d-84bc3daa781c": false,
              "066353ac-cc66-43f5-bbb8-d3340267fc51": false,
              "8abc603a-2741-4dbd-893f-d5e7896c5505": false
            }
          },
          "50b3b6f3-f4dd-4d11-bfd0-c93996e5cc18": {
            answers: {
              "faacc10b-b468-4ff6-abc8-311ffdbf5767": false,
              "dc16fdac-4503-466a-878b-7f3ff8826d11": false,
              "a76a99ef-a795-4be6-8034-857ce49aa7f2": false,
              "f9f66d3c-5d7a-4fc0-a51d-916e7837e670": false,
              "277b273e-8e32-40bd-90dc-b6c812df7358": false,
              "2084d82a-f3c7-49d3-b359-d1f87fb3a3c8": false
            }
          },
          "7b81d3ce-8ce5-4431-ac18-e57826496eec": {
            answers: {
              "9129a787-65db-4e77-bbcf-0c401ee2da15": "",
              "01951c59-5579-4a82-901a-34f100d58b1a": false,
              "afb0b04d-cfe7-47c0-b2e5-a3aa538fda8a": false,
              "2b04ca4c-a4b9-4f9e-b004-b4e2585291ee": false
            }
          },
          "dc82a239-1eb0-4c2e-a500-703e60b34892": {
            answers: {
              "f17e690e-cb5b-4ab3-ae9f-61029190a472": false,
              "6ad7744d-1517-49b3-8830-7939f0835d35": false,
              "9f6a8110-c1c4-43a7-b1d2-93967d42f38c": false,
              "3f866ce9-1d4f-4024-9f8a-a48c8ca45f18": false
            }
          },
          "f6a0916a-bbbe-4d8b-bb29-1a7c21f20c62": {
            answers: {
              "1460a184-2c40-4de0-8615-287f046b0b32": false,
              "a3ac7b28-8afd-4a7a-806d-9e1853346ae4": false,
              "05285750-8971-4ab6-acdc-ddf7260da362": false
            }
          },
          "480cd365-5c86-451a-9f65-0b9e0a341753": {
            answers: {
              "6af88d66-5359-4b9c-bd26-1493a1b6b3c2": false,
              "fae7e9df-1a6b-4c0e-a25b-2e68c084181d": false,
              "ebf41992-1ec3-456a-b918-c37cd32eec0b": false,
              "730897b3-88ea-4bce-a91d-cbab1fedecf3": false
            }
          }
        },
        skipped: false,
        completed: true,
        completedOn: "2025-11-18T11:48:34.786+00:00"
      }
    }
  );
  expect(icebreakerResponse.status()).toBe(200);

  // 2. Style Personality Interview
  const stylePersonalityResponse = await this.request.put(
    `${baseUrl}/interview/v1/interviews/9e5150f7-2483-4f85-a784-789297e4c9bb/Responses?optionalProjectId=${projectID}`,
    {
      headers: { 'Content-Type': 'application/json' },
      data: {
        id: "9e5150f7-2483-4f85-a784-789297e4c9bb",
        questions: {
          "28a7ee2b-968b-4269-9c39-909e345fdedb": {
            answers: {
              "31e2380b-92fe-4d25-89ca-2383b2819407": false,
              "04a4e5ae-ab21-44b4-91f7-2934664af9b3": false,
              "af92637e-febf-4223-858f-7c1e3e282d5c": false,
              "6bbb2752-c51f-4554-a9d7-9199cb8583cd": false,
              "5fa9fc67-cc56-4170-9b73-a43a292ee415": false
            }
          },
          "cd3b1e7c-45d1-478b-9ec8-5673adabe835": {
            answers: {
              "e7fce66b-3b5a-4462-b9ad-104706ce3fd7": false,
              "8d74c650-a5a1-450c-8329-1babf44fcc58": false,
              "1455bd2a-5554-4d8a-947c-42005904a843": false,
              "b6953086-a162-4f0d-aaab-70757c86376c": false,
              "93f21cd2-0dcd-461e-9738-f0640c330a10": false
            }
          },
          "489251ad-53e3-4d77-97d6-59698528ee86": {
            answers: {
              "79cd5540-0b5b-4dde-8fcb-38d7d66a42c1": false,
              "f3c3f064-21b3-4780-9a6b-4bbd145ec61e": false,
              "3d69a981-b7ba-4591-b6ee-c3952127dba0": false,
              "5ce81456-5550-494c-a1d8-d56abb29b9f2": false,
              "7ae8dba1-9a68-46e2-be11-e5dcd45e9b52": false
            }
          },
          "dc0f2bb1-f37d-4d21-8a82-9e077c37bb9f": {
            answers: {
              "0c1f2caf-af5b-409c-9b84-7942955e8b88": false,
              "182ae02a-406c-4176-a838-862d0671aefd": false,
              "637b89e8-8c17-45c6-8027-958544377d4c": false,
              "cef47971-9fa5-4907-a6da-bb70631ec438": false,
              "f2865661-dded-48b5-a7bc-c2d0c2dbf90d": false
            }
          }
        },
        skipped: false,
        completed: false,
        completedOn: null
      }
    }
  );
  expect([200, 404]).toContain(stylePersonalityResponse.status());

  // 3.a Design Intro Interview
  const designIntroResponse = await this.request.put(
    `${baseUrl}/interview/v1/interviews/a95d9c39-7d86-450f-937c-ec78b2f58b07/Responses?optionalProjectId=${projectID}`,
    {
      headers: { 'Content-Type': 'application/json' },
      data: {
        id: "a95d9c39-7d86-450f-937c-ec78b2f58b07",
        questions: {
          "121e0189-ab51-4e07-b9b5-9c399825fc46": {
            answers: {
              "3dfe09a4-a0a7-45c1-a1fe-199bc2cdb63c": false,
              "8a0f4bf6-124f-427d-9bc1-77ec2336d0a5": false,
              "1b7a622c-acd2-4bca-a4e5-c9bfa119fbb7": false
            }
          },
          "5cd2bc64-cc7b-4765-8cf1-699af30b9272": {
            answers: {
              "8461d53d-544c-4291-ad4a-12cea88e3704": false,
              "74b76091-667b-4e78-9d6e-6dbf975f4644": false,
              "072510ea-9f65-49d6-9698-66f8a1891365": false
            }
          },
          "22faaee1-4589-4277-a954-1bee880f31cb": {
            answers: {
              "0274a766-e67b-4f86-be6e-2c41ed554040": false,
              "4581b231-942a-4f56-ba54-54555e6b6d68": false,
              "dee5e2bb-ff1e-4cdd-87e1-6ff18d5c1997": false,
              "b6e50bd1-c44a-427e-9f29-bdbd65250959": false,
              "45440a37-ebe5-4b9f-a30c-db5e29a8ebcc": false,
              "91fd540c-fa8d-4425-aa34-ec04fa6ef4f3": false
            }
          },
          "37424a8b-9cb4-419a-ae2f-01407452e67d": {
            answers: {
              "9af4c877-0f0a-4710-99ff-331b9d83cbd7": false,
              "31b67937-dd00-4dba-acf4-695a91ee1baa": false,
              "5ea65a7e-c73e-4190-8a00-d66a09373f2f": false
            }
          }
        },
        skipped: false,
        completed: true,
        completedOn: "2026-06-29T16:00:38.173+00:00"
      }
    }
  );
  expect([200, 404]).toContain(designIntroResponse.status());

  // 3.b Design Concept Interview
const designConceptResponse = await this.request.put(
  `${baseUrl}/interview/v1/interviews/64155f03-1e5c-45e6-9438-c42976807add/Responses?optionalProjectId=${projectID}`,
  {
    headers: { 'Content-Type': 'application/json' },
    data: {
      id: "64155f03-1e5c-45e6-9438-c42976807add",
      questions: {
        "3128e16b-64a4-4878-8de3-29f8d30e83d6": {
          answers: {
            "320eae7f-d4b2-4fe5-9c31-268ee83d98f5": false,
            "d6980327-1e1f-430f-84ff-2be1a07b0822": false,
            "a3349ded-995d-45b0-9c6d-2d788a5321bb": false,
            "2f1b13d4-f4d1-48e0-ba06-39447d699b0a": false,
            "59b53455-fcac-46e0-980e-6e51690d316a": false,
            "67889c0e-db34-487c-b7e5-730ea14123a6": false,
            "882b8f4e-9563-4f7c-b93a-7433ef0ac4db": false,
            "94f95a87-33f7-43da-bca2-9056a41d3db6": false,
            "e7be5e3c-376b-4970-b027-9bfe0f4ba992": false,
            "3c863c58-3a63-4382-bedf-b49cd2c4fbf6": false,
            "7e7f9d72-90cf-4b1a-94e1-c96f6b0699a2": false,
            "7a76d510-1a10-42c6-88e1-d0aea9fa72e0": false
          }
        }
      },
      skipped: false,
      completed: true,
      completedOn: "2026-06-29T19:18:52.414+00:00"
    }
  }
);
expect([200, 404]).toContain(designConceptResponse.status());

  // 4. Starting Budget Interview
  const startingBudgetResponse = await this.request.put(
    `${baseUrl}/interview/v1/interview//content/${projectID}`,
    {
      headers: { 'Content-Type': 'application/json' },
      data: {
        codename: "interview__starting_budget",
        completedOn: "2026-06-29T16:02:03.01+00:00",
        completed: false,
        skipped: false,
        questions: [
          {
            contentId: "ab2dfd74-f690-49bb-9510-b0799f1b7e25",
            codename: "budget_category__starting",
            selection: "premium",
            included: false
          },
          {
            contentId: "fd656e1c-d29a-4097-8124-519abf9c378d",
            codename: "interview__starting_budget___method",
            selection: "average",
            included: false
          },
          {
            contentId: "94b22bb3-1c72-46da-afe5-2d145980a002",
            codename: "interview__starting_budget___zip_code",
            selection: "",
            included: false
          }
        ]
      }
    }
  );
  expect([200, 404]).toContain(startingBudgetResponse.status());

  // 5. Itemized Budget Interview
  const itemizedBudgetResponse = await this.request.put(
    `${baseUrl}/interview/v1/interview/content/${projectID}`,
    {
      headers: { 'Content-Type': 'application/json' },
      data: {
        codename: "interview__itemized_budget",
        completedOn: null,
        completed: false,
        skipped: false,
        questions: [
          {
            contentId: "d5cfd136-32db-4f89-8a0f-109752d272a8",
            codename: "budget_category__cabinets_storage",
            selection: null,
            included: false
          },
          {
            contentId: "19907e26-a78b-4650-b773-78eafb43fec4",
            codename: "budget_category__countertops",
            selection: null,
            included: false
          },
          {
            contentId: "376d61c1-a8a1-4521-898d-710e0348d27a",
            codename: "budget_category__appliances",
            selection: null,
            included: false
          },
          {
            contentId: "fd2d463a-4eda-4a4d-8892-c680d3a8c8d1",
            codename: "budget_category__plumbing_fixtures",
            selection: null,
            included: false
          },
          {
            contentId: "8dfca6b3-d61f-4dec-a88c-3ca2ab31c25e",
            codename: "budget_category__flooring",
            selection: null,
            included: false
          },
          {
            contentId: "7da3da7c-72e8-49fc-b9ce-7ebfa76e6969",
            codename: "budget_category__lighting",
            selection: null,
            included: false
          },
          {
            contentId: "79ce8404-f9af-496d-97d2-6625704ece61",
            codename: "budget_category__labor",
            selection: null,
            included: false
          },
          {
            contentId: "4b830544-f886-44ce-b2c9-d5c2c99e7a04",
            codename: "budget_category__contingency",
            selection: null,
            included: false
          }
        ]
      }
    }
  );
  expect([200, 404]).toContain(itemizedBudgetResponse.status());
}

}



export default AuthHelper;