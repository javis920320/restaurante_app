import AppLayout from '@/layouts/app-layout';
import ConfiguracionLayout from '@/layouts/configuracion/layout';
import { Head } from '@inertiajs/react';

const mesas = () => {
    return (
        <AppLayout>
            <Head title="Mesas" />
            <ConfiguracionLayout>
                <div>mesas</div>
            </ConfiguracionLayout>
        </AppLayout>
    );
};

export default mesas;
