import { test, expect } from '@playwright/test';
import AuthHelper from '../../helpers/api-helpers';
import { error } from 'console';

test.describe('Auth0 Cleanup', () => {

  test('Delete all Auth0 users matching email pattern', async ({ request }) => {
    test.setTimeout(1200000); // Set timeout to 20 minutes to allow for multiple deletions with delays
    const authHelper = new AuthHelper(request);

    // Replace with your email pattern or use env variable
    const emailPattern = process.env.CLEANUP_EMAIL_PATTERN ?? 'soumabha.bhandari.mbd01';

    console.log(`\n🔍 Searching for users with email pattern: ${emailPattern}`);

    const userIds = await authHelper.getUsersByEmailAll(emailPattern);

    if (userIds.length === 0) {
      console.log('✅ No users found to delete. Skipping.');
      return;
    }

    console.log(`\n🗑️  Found ${userIds.length} users to delete...`);

    let deleted = 0;
    let failed = 0;

    for (const userId of userIds) {
      try {
        await authHelper.deleteExistingUser(userId);
        console.log(`✓ Deleted: ${userId}`);
        deleted++;
      } catch (error) {
        console.log(`✗ Failed to delete: ${userId} - ${error}`);
        failed++;
      }
      console.log(`⏳ Waiting 10 seconds before next deletion...`);
      await new Promise(resolve => setTimeout(resolve, 10000));
      console.log(`✅ Wait complete. (${deleted + failed}/${userIds.length})`);
    }

    console.log(`\n📊 Cleanup Summary:`);
    console.log(`   Total found  : ${userIds.length}`);
    console.log(`   Deleted      : ${deleted}`);
    console.log(`   Failed       : ${failed}`);

    //expect(failed).toBe(0);
  });

});