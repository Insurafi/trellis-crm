import { storage } from './server/storage';
import { hashPassword } from './server/auth';

async function resetAaronPassword() {
  try {
    // Aaron's user ID is 13 as mentioned in logs
    const userId = 13;
    const newPassword = "agent123"; // Reset to the standard agent password
    
    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);
    
    // Update the user record with new password
    const updatedUser = await storage.updateUser(userId, {
      password: hashedPassword
    });
    
    if (updatedUser) {
      console.log("✅ Password reset successful for Aaron (User ID: 13)");
      console.log("Username: aaron");
      console.log("New Password: agent123");
    } else {
      console.log("❌ Failed to reset password. User not found.");
    }
  } catch (error) {
    console.error("Error resetting password:", error);
  }
}

resetAaronPassword();
