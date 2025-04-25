import { useEffect, useRef } from 'react';
import { useAuth } from './use-auth';
import { apiRequest } from "@/lib/queryClient";

/**
 * Hook to manage user online status with automatic heartbeats
 * Sends periodic updates to the server to maintain accurate online status
 */
export function useOnlineStatus() {
  const { user } = useAuth();
  const userId = user?.id;
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const visibilityChangeRef = useRef<boolean>(false);
  
  // Start heartbeat when component mounts
  useEffect(() => {
    // Don't send heartbeats if user is not authenticated
    if (!userId) return;
    
    // Function to update user's online status
    const updateOnlineStatus = async (isOnline: boolean) => {
      try {
        await apiRequest(
          'POST',
          `/api/users/${userId}/online-status`,
          { isOnline }
        );
      } catch (error) {
        console.error('Failed to update online status:', error);
      }
    };
    
    // Set user as online immediately when component mounts
    updateOnlineStatus(true);
    
    // Handle page visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Page is visible again, set status to online
        if (visibilityChangeRef.current) {
          updateOnlineStatus(true);
          visibilityChangeRef.current = false;
        }
      } else {
        // Page is hidden, mark the change but don't set offline yet
        // (user might just be switching tabs briefly)
        visibilityChangeRef.current = true;
      }
    };
    
    // Set up heartbeat interval to regularly update online status
    heartbeatIntervalRef.current = setInterval(() => {
      // Only send active heartbeat if page is visible
      if (document.visibilityState === 'visible') {
        updateOnlineStatus(true);
      }
    }, 60000); // Send heartbeat every minute
    
    // Set up event listeners
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', () => updateOnlineStatus(false));
    
    // Clean up when component unmounts
    return () => {
      // Clear interval and remove event listeners
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', () => updateOnlineStatus(false));
      
      // Set user as offline when component unmounts
      updateOnlineStatus(false);
    };
  }, [userId]);
}