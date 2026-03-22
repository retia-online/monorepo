'use client';

import { useSession, signOut } from 'next-auth/react';
import { Navbar } from '@retia-global/ui';

interface NavbarWrapperProps {
    showAuthButtons?: boolean;
    instanceName?: string;
}

export function NavbarWrapper({ showAuthButtons = true, instanceName }: NavbarWrapperProps) {
    const { data: session } = useSession();

    return (
        <Navbar
            showAuthButtons={showAuthButtons}
            instanceName={instanceName}
            user={session?.user ?? null}
            onLogout={() => signOut({ callbackUrl: '/login' })}
        />
    );
}
