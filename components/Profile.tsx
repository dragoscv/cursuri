import { useContext } from "react"
import { AppContext } from "@/components/AppContext"

export default function Profile(props: any) {

    const context = useContext(AppContext)
    if (!context) {
        throw new Error("You probably forgot to put <AppProvider>.")
    }
    const { userPaidProducts, courses } = context

    return (
        <>
            <main className="flex min-h-screen flex-col items-center justify-start p-24 gap-4">
                <h1>Payments</h1>
                <div className="flex flex-col flex-wrap justify-center items-center gap-4 w-full max-w-md">
                    {userPaidProducts?.map((userPaidProduct: any) => {
                        return (
                            <div key={userPaidProduct.id} id={userPaidProduct.id}
                                className={`bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700
                            `}
                            >
                                <div className="flex flex-row items-center justify-between p-4 gap-4">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {new Date(userPaidProduct.created * 1000).toLocaleDateString('ro-RO', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                            hour12: false,
                                        })
                                        }

                                    </span>
                                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">{
                                        Object.keys(courses).map((key: any) => {
                                            if (courses[key]?.id === userPaidProduct?.metadata?.courseId) {
                                                return courses[key].name
                                            }
                                            return null;
                                        }).filter(Boolean)
                                    }</h2>
                                    <p className="text-lg font-medium text-gray-900 dark:text-white">{
                                        Object.keys(courses).map((key: any) => {
                                            if (courses[key]?.id === userPaidProduct?.metadata?.courseId &&
                                                courses[key]?.priceProduct?.prices?.[0]?.unit_amount) {
                                                return (courses[key].priceProduct.prices[0].unit_amount / 100).toLocaleString('ro-RO', {
                                                    style: 'currency',
                                                    currency: 'RON',
                                                })
                                            }
                                            return null;
                                        }).filter(Boolean)
                                    }
                                    </p>
                                    {/* <span className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">Invoice</span> */}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </main>
        </>
    )
}