export const fetchTransactionAllocations = async (token: string, transactionId: number) => {
    const url = `http://localhost:8080/api/allocations/${transactionId}`
    const response = await fetch(url, {
        method: "GET",
        headers: {"Authorization": `Bearer ${token}`}
    })
    return response
}