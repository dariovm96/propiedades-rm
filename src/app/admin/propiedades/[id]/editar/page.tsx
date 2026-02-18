import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import EditPropertyForm from "./EditPropertyForm"

type Props = {
    params: Promise<{
        id: string
    }>
}

export default async function EditPropertyPage({ params }: Props) {
    const { id } = await params

    const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single()

    if (error || !data) {
        notFound()
    }

    return (
        <div className="max-w-3xl mx-auto py-12">
            <EditPropertyForm property={data} />
        </div>
    )
}
