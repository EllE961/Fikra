import { useState, useCallback } from 'react';
import { openaiService } from '../services/openaiService';
import { useAuth } from './useAuth';
import { useLoading } from '../context/LoadingContext';
import { firestore } from '../services/firebase';
import { logInfo } from '../services/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IDEAS_CACHE_KEY = '@fikra_user_ideas';

/**
 * Custom hook for generating and managing business ideas
 * @returns {Object} Methods and state for idea generation
 */
export const useIdeaGenerator = () => {
  const [error, setError] = useState(null);
  const [generatedIdeas, setGeneratedIdeas] = useState([]);
  const [cachedIdeas, setCachedIdeas] = useState([]);
  const { user } = useAuth();
  const { startLoading, stopLoading, isLoading } = useLoading();

  /**
   * Generate business ideas based on user profile
   * @param {Object} userProfile - User profile with interests, skills, and location
   */
  const generateIdeas = useCallback(async (userProfile) => {
    if (!userProfile) {
      setError('User profile is required');
      return;
    }

    startLoading('Generating business ideas...');
    setError(null);

    try {
      const ideas = await openaiService.generateBusinessIdeas(userProfile);
      setGeneratedIdeas(ideas);
      return ideas;
    } catch (err) {
      setError('Failed to generate ideas. Please try again.');
      logInfo(`Error in generateIdeas: ${err.message}`);
      return [];
    } finally {
      stopLoading();
    }
  }, [user, startLoading, stopLoading]);

  /**
   * Save a single selected idea to Firestore
   * @param {Object} idea - The idea to save
   * @param {boolean} isPublic - Whether the idea should be public (default: false)
   * @returns {Promise<boolean>} - Success status
   */
  const saveSelectedIdea = useCallback(async (idea, isPublic = false) => {
    if (!user) {
      setError('User authentication required');
      return false;
    }

    if (!idea) {
      setError('No idea provided');
      return false;
    }

    startLoading('Saving your idea...');
    setError(null);

    try {
      // Add created timestamp, user ID, and isPublic flag
      const ideaToSave = {
        ...idea,
        createdAt: new Date(),
        userId: user.uid,
        isPublic: isPublic
      };

      // Save the idea to Firestore
      const ideaRef = firestore
        .collection('users')
        .doc(user.uid)
        .collection('ideas')
        .doc(idea.id);
      
      await ideaRef.set(ideaToSave);
      
      // Update local cache
      const updatedIdeas = [...cachedIdeas];
      const existingIndex = updatedIdeas.findIndex(i => i.id === idea.id);
      
      if (existingIndex >= 0) {
        updatedIdeas[existingIndex] = ideaToSave;
      } else {
        updatedIdeas.unshift(ideaToSave);
      }
      
      setCachedIdeas(updatedIdeas);
      await cacheIdeasToStorage(updatedIdeas);

      logInfo(`Successfully saved idea ${idea.id} to Firestore`);
      return true;
    } catch (err) {
      setError('Failed to save idea. Please try again.');
      logInfo(`Error saving idea to Firestore: ${err.message}`);
      return false;
    } finally {
      stopLoading();
    }
  }, [user, startLoading, stopLoading, cachedIdeas]);

  /**
   * Refine an existing business idea
   * @param {Object} idea - The idea to refine
   * @param {Object} userProfile - User profile with location data
   */
  const refineIdea = useCallback(async (idea, userProfile) => {
    if (!idea || !userProfile) {
      setError('Idea and user profile are required');
      return null;
    }

    startLoading('Refining your business idea...');
    setError(null);

    try {
      const refinedIdea = await openaiService.refineBusinessIdea(idea, userProfile);
      
      // If user is authenticated, update the idea in Firestore
      if (user && idea.id) {
        await updateIdeaInFirestore(refinedIdea);
        
        // Update cache
        const updatedIdeas = [...cachedIdeas];
        const existingIndex = updatedIdeas.findIndex(i => i.id === refinedIdea.id);
        
        if (existingIndex >= 0) {
          updatedIdeas[existingIndex] = refinedIdea;
          setCachedIdeas(updatedIdeas);
          await cacheIdeasToStorage(updatedIdeas);
        }
      }

      return refinedIdea;
    } catch (err) {
      setError('Failed to refine idea. Please try again.');
      logInfo(`Error in refineIdea: ${err.message}`);
      return null;
    } finally {
      stopLoading();
    }
  }, [user, startLoading, stopLoading, cachedIdeas]);

  /**
   * Cache ideas to AsyncStorage
   */
  const cacheIdeasToStorage = async (ideas) => {
    if (!user) return;
    
    try {
      const ideasForCache = ideas.map(idea => ({
        ...idea,
        createdAt: idea.createdAt instanceof Date ? 
          { seconds: Math.floor(idea.createdAt.getTime() / 1000) } : 
          idea.createdAt,
        updatedAt: idea.updatedAt instanceof Date ? 
          { seconds: Math.floor(idea.updatedAt.getTime() / 1000) } : 
          idea.updatedAt
      }));
      
      await AsyncStorage.setItem(
        `${IDEAS_CACHE_KEY}_${user.uid}`, 
        JSON.stringify(ideasForCache)
      );
    } catch (err) {
      logInfo(`Error caching ideas to storage: ${err.message}`);
    }
  };

  /**
   * Load ideas from AsyncStorage cache
   */
  const loadIdeasFromCache = async () => {
    if (!user) return [];
    
    try {
      const cachedData = await AsyncStorage.getItem(`${IDEAS_CACHE_KEY}_${user.uid}`);
      if (cachedData) {
        const parsedIdeas = JSON.parse(cachedData);
        setCachedIdeas(parsedIdeas);
        return parsedIdeas;
      }
    } catch (err) {
      logInfo(`Error loading ideas from cache: ${err.message}`);
    }
    return [];
  };

  /**
   * Save generated ideas to Firestore
   * @param {Array} ideas - Array of generated ideas
   */
  const saveIdeasToFirestore = async (ideas) => {
    if (!user) return;
    
    try {
      const batch = firestore.batch();
      
      ideas.forEach(idea => {
        const ideaRef = firestore.collection('users').doc(user.uid).collection('ideas').doc(idea.id);
        batch.set(ideaRef, {
          ...idea,
          createdAt: new Date(),
          userId: user.uid
        });
      });
      
      await batch.commit();
      
      // Update cache with new ideas
      const updatedCache = [...ideas, ...cachedIdeas];
      setCachedIdeas(updatedCache);
      await cacheIdeasToStorage(updatedCache);
      
      logInfo(`Successfully saved ${ideas.length} ideas to Firestore`);
    } catch (err) {
      logInfo(`Error saving ideas to Firestore: ${err.message}`);
      // We don't throw here to avoid disrupting the user experience
    }
  };

  /**
   * Update an idea in Firestore
   * @param {Object} idea - The idea to update
   */
  const updateIdeaInFirestore = async (idea) => {
    if (!user) return;
    
    try {
      const ideaRef = firestore.collection('users').doc(user.uid).collection('ideas').doc(idea.id);
      const updatedIdea = {
        ...idea,
        updatedAt: new Date()
      };
      
      await ideaRef.update(updatedIdea);
      
      // Update the cache
      const updatedCache = [...cachedIdeas];
      const index = updatedCache.findIndex(i => i.id === idea.id);
      if (index >= 0) {
        updatedCache[index] = updatedIdea;
        setCachedIdeas(updatedCache);
        await cacheIdeasToStorage(updatedCache);
      }
      
      logInfo(`Successfully updated idea ${idea.id} in Firestore`);
    } catch (err) {
      logInfo(`Error updating idea in Firestore: ${err.message}`);
      // We don't throw here to avoid disrupting the user experience
    }
  };

  /**
   * Fetch user's saved ideas from Firestore with offline first approach
   */
  const fetchSavedIdeas = useCallback(async () => {
    if (!user) {
      return [];
    }

    // First check if we have cached ideas
    if (cachedIdeas.length > 0) {
      return cachedIdeas;
    }
    
    // Then try to load from AsyncStorage
    const offlineIdeas = await loadIdeasFromCache();
    if (offlineIdeas.length > 0) {
      // Return cached ideas immediately but still fetch fresh data in the background
      setTimeout(() => fetchFreshIdeas(), 100);
      return offlineIdeas;
    }
    
    // If no cache, load from Firestore
    return await fetchFreshIdeas();
  }, [user, cachedIdeas]);
  
  /**
   * Fetch fresh ideas from Firestore and update cache
   */
  const fetchFreshIdeas = async () => {
    startLoading('Loading ideas...');
    setError(null);

    try {
      const snapshot = await firestore
        .collection('users')
        .doc(user.uid)
        .collection('ideas')
        .orderBy('createdAt', 'desc')
        .get();

      const ideas = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Update cache
      setCachedIdeas(ideas);
      await cacheIdeasToStorage(ideas);

      return ideas;
    } catch (err) {
      setError('Failed to fetch saved ideas');
      logInfo(`Error fetching saved ideas: ${err.message}`);
      return cachedIdeas.length > 0 ? cachedIdeas : [];
    } finally {
      stopLoading();
    }
  };

  return {
    loading: isLoading,
    error,
    generatedIdeas,
    generateIdeas,
    saveSelectedIdea,
    refineIdea,
    fetchSavedIdeas
  };
}; 