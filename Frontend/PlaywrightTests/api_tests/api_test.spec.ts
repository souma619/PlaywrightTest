import { test, expect } from '@playwright/test';
import AuthHelper from '../helpers/api-helpers';
import { stringify } from 'querystring';

test('Get Access Token', async ({ request }) => {
  const authHelper = new AuthHelper(request);

  // Get access token
  const accessToken = await authHelper.getAccessToken();
  expect(accessToken).toBeTruthy();


});

test('Add New User', async ({ request }) => {
  const authHelper = new AuthHelper(request);
  const oldId = await authHelper.getUser();
  if (oldId == false) { //Create new user as old id doesn't exist
    const id = await authHelper.createNewUser();
    expect(id).toBeTruthy();
    console.log("New User ID is Created:" + id);
  }
  else {
    //Display existing user details
    console.log("User ID is already present:" + oldId);
  }

});

test('Get User by Email', async ({ request }) => {
  const authHelper = new AuthHelper(request);
  const oldId = await authHelper.getUser();
  if (oldId == false) { //Id doesn't exist
    console.log("User ID associated with the email is either deleted or not present:");
  }
  else {
    //Display existing user details
    expect(oldId).toBeTruthy();
    console.log("User ID is already present:" + oldId);
  }

});

test('Delete User', async ({ request }) => {
  const authHelper = new AuthHelper(request);
  const oldId = await authHelper.getUser();
  if (oldId == false) {
    console.log("User ID is associated with email is already Deleted");
  }
  else {
    expect(oldId).toBeTruthy();
    await authHelper.deleteExistingUser(oldId);
  }

});

