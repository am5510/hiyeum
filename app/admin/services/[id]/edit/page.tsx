import { prisma } from "@/lib/prisma";
import EditServiceForm from "./EditServiceForm";

export async function generateStaticParams() {
    const services = await prisma.service.findMany();
    return services.map((service) => ({
        id: service.id,
    }));
}

export default async function EditServicePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    return <EditServiceForm id={params.id} />;
}
