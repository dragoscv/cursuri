'use client'

import React, { useContext, useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Divider, Checkbox, Pagination, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Chip, Select } from '@heroui/react';
import SelectItem from '@/components/ui/SelectItem';
import { AppContext } from '@/components/AppContext';
import { getFirestore, doc, writeBatch } from 'firebase/firestore';
import { firebaseApp } from '@/utils/firebase/firebase.config';
import { Lesson } from '@/types';

type ContentType = 'course' | 'lesson';
type BatchAction = 'status' | 'delete' | 'category' | 'visibility' | 'price';

const BatchOperations: React.FC = () => {
  const context = useContext(AppContext);
  // Safely access context properties with optional chaining
  const { courses, lessons, isAdmin } = context || {};

  const [contentType, setContentType] = useState<ContentType>('course');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedAction, setSelectedAction] = useState<BatchAction | null>(null);
  const [statusValue, setStatusValue] = useState('active');
  const [categoryValue, setCategoryValue] = useState('programming');
  const [visibilityValue, setVisibilityValue] = useState('public');
  const [priceValue, setPriceValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Firestore instance
  const db = getFirestore(firebaseApp);

  // Options for batch actions dropdown
  const actionOptions = [
    { value: 'status', label: 'Update Status' },
    { value: 'category', label: 'Change Category' },
    { value: 'visibility', label: 'Change Visibility' },
    { value: 'price', label: 'Update Price' },
    { value: 'delete', label: 'Delete' },
  ];

  // Function to render the appropriate action input based on selected action
  const renderActionInput = () => {
    switch (selectedAction) {
      case 'status':
        return (
          <Select
            value={statusValue}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusValue(e.target.value)}
            className="w-full mb-4"
          >
            <SelectItem key="active" value="active" textValue="active">Active</SelectItem>
            <SelectItem key="draft" value="draft" textValue="draft">Draft</SelectItem>
            <SelectItem key="archived" value="archived" textValue="archived">Archived</SelectItem>
          </Select>
        );
      case 'delete':
        return (
          <div className="text-[color:var(--ai-danger)] font-semibold mb-4">
            Warning: This action cannot be undone!
          </div>
        );
      case 'category':
        return (
          <Select
            value={categoryValue}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategoryValue(e.target.value)}
            className="w-full mb-4"
          >
            <SelectItem key="programming" value="programming" textValue="programming">Programming</SelectItem>
            <SelectItem key="design" value="design" textValue="design">Design</SelectItem>
            <SelectItem key="business" value="business" textValue="business">Business</SelectItem>
            <SelectItem key="marketing" value="marketing" textValue="marketing">Marketing</SelectItem>
            <SelectItem key="productivity" value="productivity" textValue="productivity">Productivity</SelectItem>
          </Select>
        );
      case 'visibility':
        return (
          <Select
            value={visibilityValue}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setVisibilityValue(e.target.value)}
            className="w-full mb-4"
          >
            <SelectItem key="public" value="public" textValue="public">Public</SelectItem>
            <SelectItem key="private" value="private" textValue="private">Private</SelectItem>
          </Select>
        );
      case 'price':
        return (
          <input
            type="number"
            value={priceValue}
            onChange={(e) => setPriceValue(e.target.value)}
            placeholder="Enter price (0 for free)"
            className="w-full p-2 border rounded mb-4"
          />
        );
      default:
        return null;
    }
  };
  // Transform object data into flat arrays
  const courseItems = Object.values(courses || {});

  const lessonItems = contentType === 'lesson' && lessons
    ? Object.values(lessons).flatMap(courseLessons =>
      Object.values(courseLessons).map(lesson => {
        // Ensure lesson is typed correctly
        const typedLesson = lesson as Lesson;
        return {
          ...typedLesson,
          courseName: typedLesson.courseId && courses && courses[typedLesson.courseId]
            ? courses[typedLesson.courseId].name
            : 'Unknown Course'
        };
      })
    )
    : [];

  const items = contentType === 'course' ? courseItems : lessonItems;

  // Pagination logic
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const paginatedItems = items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Select/deselect all items on current page
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedItems(paginatedItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  // Select/deselect single item
  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    }
  };

  // Reset selection when changing content type
  useEffect(() => {
    setSelectedItems([]);
    setSelectAll(false);
    setCurrentPage(1);
  }, [contentType]);

  // Update selectAll state when all items are manually selected
  useEffect(() => {
    if (paginatedItems.length > 0 && selectedItems.length === paginatedItems.length) {
      setSelectAll(true);
    } else if (selectAll && selectedItems.length < paginatedItems.length) {
      setSelectAll(false);
    }
  }, [selectedItems, paginatedItems]);

  // Reset action form when action changes
  useEffect(() => {
    setError('');
    setSuccess('');
  }, [selectedAction]);

  // Handle batch operations
  const handleBatchOperation = async () => {
    if (!selectedAction || selectedItems.length === 0) {
      setError('Please select an action and at least one item');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const batch = writeBatch(db);
      const collection = contentType === 'course' ? 'courses' : 'lessons';

      for (const itemId of selectedItems) {
        const itemRef = doc(db, collection, itemId);

        switch (selectedAction) {
          case 'status':
            batch.update(itemRef, { status: statusValue });
            break;
          case 'delete':
            batch.delete(itemRef);
            break;
          case 'category':
            if (contentType === 'course') {
              batch.update(itemRef, { category: categoryValue });
            }
            break;
          case 'visibility':
            batch.update(itemRef, { visibility: visibilityValue });
            break;
          case 'price':
            if (contentType === 'course') {
              batch.update(itemRef, { price: priceValue === '0' ? 0 : parseInt(priceValue) });
            }
            break;
        }
      }

      await batch.commit();

      // Reset form
      setSelectedItems([]);
      setSelectAll(false);
      setSuccess(`Successfully applied ${selectedAction} to ${selectedItems.length} items`);

      // Close confirmation modal if open
      setConfirmationOpen(false);    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error performing batch operation:', error);
      setError(`Error: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return <div className="p-4">You don't have permission to access this page.</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">Batch Operations</h1>
          <p className="text-sm text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">
            Perform actions on multiple courses or lessons at once
          </p>
        </CardHeader>
        <CardBody>
          <div className="grid gap-6 mb-6">
            {/* Content type selector */}
            <div>
              <label className="block text-sm font-medium mb-2">Content Type</label>
              <div className="flex gap-3">
                <Button
                  color={contentType === 'course' ? 'primary' : 'default'}
                  onPress={() => setContentType('course')}
                >
                  Courses
                </Button>
                <Button
                  color={contentType === 'lesson' ? 'primary' : 'default'}
                  onPress={() => setContentType('lesson')}
                >
                  Lessons
                </Button>
              </div>
            </div>

            {/* Action selector - only show when items are selected */}
            {selectedItems.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Action for {selectedItems.length} selected {contentType}(s)
                </label>
                <div className="flex gap-3">
                  {actionOptions.map(action => (
                    <Button
                      key={action.value}
                      color={selectedAction === action.value ? 'primary' : 'default'}
                      onPress={() => setSelectedAction(action.value as BatchAction)}
                      isDisabled={action.value === 'price' && contentType !== 'course'}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>

                {selectedAction && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Configure {selectedAction}</h3>
                    {renderActionInput()}

                    <div className="flex justify-end gap-2">
                      <Button
                        color="danger"
                        onPress={() => {
                          if (selectedAction === 'delete') {
                            setConfirmationOpen(true);
                          } else {
                            handleBatchOperation();
                          }
                        }}
                        isLoading={loading}
                      >
                        Apply to {selectedItems.length} items
                      </Button>
                      <Button
                        color="default"
                        variant="flat"
                        onPress={() => {
                          setSelectedItems([]);
                          setSelectAll(false);
                          setSelectedAction(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>

                    {error && <div className="mt-2 text-[color:var(--ai-danger)]">{error}</div>}
                    {success && <div className="mt-2 text-[color:var(--ai-success)]">{success}</div>}
                  </div>
                )}
              </div>
            )}
          </div>

          <Divider className="my-4" />          {/* Content table */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">{contentType === 'course' ? 'Courses' : 'Lessons'}</h2>
            </CardHeader>
            <CardBody>
              {/* Use standard HTML table instead of HeroUI Table components */}
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-3 py-2">
                      <Checkbox
                        isSelected={selectAll}
                        onValueChange={handleSelectAll}
                        aria-label="Select all items"
                      />
                    </th>
                    <th className="px-3 py-2 text-left">NAME</th>
                    {contentType === 'lesson' && <th className="px-3 py-2 text-left">COURSE</th>}
                    <th className="px-3 py-2 text-left">STATUS</th>
                    {contentType === 'course' && <th className="px-3 py-2 text-left">PRICE</th>}
                    <th className="px-3 py-2 text-left">CREATED</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.length > 0 ? (
                    paginatedItems.map((item) => {
                      // Pre-compute all cells for this row
                      return (
                        <tr key={item.id} className="border-b border-[color:var(--ai-card-border)] dark:border-[color:var(--ai-card-border)]">
                          <td className="px-3 py-2">
                            <Checkbox
                              isSelected={selectedItems.includes(item.id)}
                              onValueChange={(checked) => handleSelectItem(item.id, checked)}
                              aria-label={`Select ${item.name}`}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <div className="font-medium">{item.name}</div>
                          </td>                          {contentType === 'lesson' && (
                            <td className="px-3 py-2">
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              <div className="text-sm">{(item as any).courseName}</div>
                            </td>
                          )}
                          <td className="px-3 py-2">
                            <Chip
                              color={item.status === 'active' ? 'success' : item.status === 'draft' ? 'warning' : 'default'}
                              size="sm"
                            >
                              {item.status || 'Unknown'}
                            </Chip>
                          </td>
                          {contentType === 'course' && (
                            <td className="px-3 py-2">
                              {'price' in item && item.price ? `${item.price} RON` : 'Free'}
                            </td>
                          )}
                          <td className="px-3 py-2">
                            <div className="text-sm text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">
                              {'createdAt' in item && item.createdAt ? new Date(item.createdAt.toString()).toLocaleDateString() : 'Unknown'}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={contentType === 'course' ? 5 : 6} className="px-3 py-4 text-center">
                        No items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                  <Pagination
                    total={totalPages}
                    initialPage={1}
                    page={currentPage}
                    onChange={setCurrentPage}
                  />
                </div>
              )}
            </CardBody>
          </Card>
        </CardBody>
      </Card>

      {/* Confirmation modal for delete action */}
      <Modal isOpen={confirmationOpen} onClose={() => setConfirmationOpen(false)}>
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalBody>
            Are you sure you want to delete {selectedItems.length} {contentType}(s)? This action cannot be undone.
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onPress={handleBatchOperation} isLoading={loading}>
              Delete
            </Button>
            <Button color="default" variant="flat" onPress={() => setConfirmationOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default BatchOperations;

