$filePath = 'E:\GitHub\cursuri\components\AppContext.tsx'
$content = Get-Content $filePath -Raw

# Find and replace the problem section
$pattern = '(?s)(const unsubscribe = onSnapshot\(lessonsQuery, \(querySnapshot\) => \{.*?)(\s+}\s+catch \(error\) \{.*?)(\s+}\s+}\),)'
$replacement = '$1
                });
                // Return the unsubscribe function
                return unsubscribe;
            } catch (error) {
                console.error("Error setting up lessons listener:", error);
                // Set loading state to error
                dispatch({
                    type: "SET_LESSON_LOADING_STATE",
                    payload: { courseId, status: "error" }
                });

                // Mark request as no longer pending
                setRequestPending(cacheKey, false);
                
                // Return a no-op cleanup function
                return () => { /* No cleanup needed after error */ };
            }
        },'

$newContent = $content -replace $pattern, $replacement

# Save the changes
$newContent | Set-Content $filePath -NoNewline
