
import { useContext, useEffect } from "react"
import { AppContext } from "@/components/AppContext"
import AddLesson from "./AddLesson"
import Lesson from "./Lesson"
import Reviews from "./Reviews"

export default function Course(props: any) {
    const { courseId } = props


    const context = useContext(AppContext)
    if (!context) {
        throw new Error("You probably forgot to put <AppProvider>.")
    }
    const { courses, isAdmin, openModal, closeModal, lessons, getCourseLessons, userPaidProducts } = context

    useEffect(() => {
        getCourseLessons(courseId)
    }, [courseId, getCourseLessons]);

    return (
        <>
            <main className="flex min-h-screen flex-col items-center justify-start p-24 gap-4">
                {isAdmin && <>
                    <button type="button" title="Add Lesson" className="text-white bg-[#4285F4] hover:bg-[#4285F4]/30 dark:hover:bg-[#4285F4]/30 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 mr-2"
                        onClick={() => openModal({
                            id: 'addLesson',
                            isOpen: true,
                            hideCloseButton: false,
                            backdrop: 'blur',
                            size: 'full',
                            scrollBehavior: 'inside',
                            isDismissable: true,
                            modalHeader: `Add Lesson ${courseId}`,
                            modalBody: <AddLesson courseId={courseId} onClose={() => closeModal('addLesson')} />,
                            footerDisabled: true,
                            noReplaceURL: true,
                            onClose: () => closeModal('addLesson'),
                        })}
                    >
                        Add Lesson
                    </button>
                </>}

                <div className="flex flex-row flex-wrap justify-center items-center gap-4 w-full max-w-md">

                    {Object.keys(lessons).map((key: any) => {
                        // console.log(lessons[key])
                        if (courseId === key) {
                            // console.log(lessons[key])
                            return (Object.entries(lessons[key]).map(([key, lesson]: any) => (
                                <div key={lesson.id} id={lesson.id}
                                    className={`bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700
                                ${userPaidProducts?.find((userPaidProduct: any) => userPaidProduct.metadata.courseId === courseId) ? 'cursor-pointer' : ''}
                                `}
                                    onClick={() => {
                                        if (userPaidProducts?.find((userPaidProduct: any) => userPaidProduct.metadata.courseId === courseId)) {
                                            openModal({
                                                id: lesson.id,
                                                isOpen: true,
                                                hideCloseButton: false,
                                                backdrop: 'blur',
                                                size: 'full',
                                                scrollBehavior: 'inside',
                                                isDismissable: true,
                                                modalHeader: `Lesson: ${lesson.name}`,
                                                modalBody: <Lesson lesson={lesson} onClose={() => closeModal(lesson.id)} />,
                                                headerDisabled: true,
                                                footerDisabled: true,
                                                noReplaceURL: true,
                                                onClose: () => closeModal(lesson.id),
                                            })
                                        }
                                    }
                                    }
                                >
                                    <div className="px-5 p-5">
                                        <h5 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                                            {lesson.name}
                                        </h5>
                                    </div>
                                </div>
                            )))
                        }
                    }
                    )}
                </div>
                <Reviews courseId={courseId} />
            </main >
        </>
    )
}
