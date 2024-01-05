


export default function Lesson(props: any) {
    const { lesson, onClose } = props

    return (
        <>
            <main className="flex flex-col h-full items-start justify-center p-2 text-black dark:text-white gap-2 w-full max-w-md">
                <h1>Lesson {lesson.name}</h1>
                <video
                    controls
                    className="w-full"
                    src={lesson.file}
                />
            </main>
        </>
    )
}