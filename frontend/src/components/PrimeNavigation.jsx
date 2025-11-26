import React, { useState, useRef } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { Menu } from 'primereact/menu';
import { Badge } from 'primereact/badge';
import { Avatar } from 'primereact/avatar';
import { classNames } from 'primereact/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { ADMIN_EMAILS } from './ProtectedAdminRoute';

export default function PrimeNavigation() {
    const [visible, setVisible] = useState(false);
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();
    const { userProfile } = useUser();
    const isAdmin = currentUser?.email && ADMIN_EMAILS.includes(currentUser.email);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
            setVisible(false);
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const itemRenderer = (item) => (
        <div className='p-menuitem-content'>
            <a className="flex align-items-center p-menuitem-link cursor-pointer" onClick={item.command}>
                <span className={item.icon} />
                <span className="mx-2">{item.label}</span>
                {item.badge && <Badge className="ml-auto" value={item.badge} />}
                {item.shortcut && <span className="ml-auto border-1 surface-border border-round surface-100 text-xs p-1">{item.shortcut}</span>}
            </a>
        </div>
    );

    const items = [
        {
            template: () => {
                return (
                    <div className="flex flex-col gap-4 px-2 py-4 mb-4 border-b border-gray-200 dark:border-gray-700">
                        <span className="inline-flex align-items-center gap-1">
                            <img src="/logo.png" alt="CoverBots Logo" className="h-10 w-auto" />
                            <span className="font-medium text-xl font-semibold text-[#003366] dark:text-white">
                                Cover<span className="text-[#508C7E]">Bots</span>
                            </span>
                        </span>
                    </div>
                );
            }
        },
        {
            label: 'Navigation',
            items: [
                {
                    label: 'Home',
                    icon: 'pi pi-home',
                    command: () => { navigate('/'); setVisible(false); },
                    template: itemRenderer
                },
                {
                    label: 'About Us',
                    icon: 'pi pi-info-circle',
                    command: () => { navigate('/about'); setVisible(false); },
                    template: itemRenderer
                },
                {
                    label: 'Get Recommended',
                    icon: 'pi pi-bolt',
                    command: () => { navigate('/quiz'); setVisible(false); },
                    template: itemRenderer
                }
            ]
        },
        {
            label: 'Portals',
            items: [
                ...(isAdmin ? [{
                    label: 'Admin Dashboard',
                    icon: 'pi pi-shield',
                    command: () => { navigate('/admin/dashboard'); setVisible(false); },
                    template: itemRenderer
                }] : []),
                ...(userProfile?.role === 'vendor' ? [{
                    label: 'Vendor Portal',
                    icon: 'pi pi-briefcase',
                    command: () => { navigate('/vendor/dashboard'); setVisible(false); },
                    template: itemRenderer
                }] : []),
                ...((!currentUser || (userProfile && userProfile.role !== 'vendor')) ? [{
                    label: 'Become a Vendor',
                    icon: 'pi pi-briefcase',
                    command: () => {
                        if (currentUser) {
                            navigate('/vendor/apply');
                        } else {
                            navigate('/vendor/register');
                        }
                        setVisible(false);
                    },
                    template: itemRenderer
                }] : [])
            ]
        },
        {
            label: 'Account',
            items: [
                ...(currentUser ? [
                    {
                        label: 'Profile',
                        icon: 'pi pi-user',
                        command: () => { navigate('/profile'); setVisible(false); },
                        template: itemRenderer
                    },
                    {
                        label: 'Logout',
                        icon: 'pi pi-sign-out',
                        command: handleLogout,
                        template: itemRenderer
                    }
                ] : [
                    {
                        label: 'Login',
                        icon: 'pi pi-sign-in',
                        command: () => { navigate('/login'); setVisible(false); },
                        template: itemRenderer
                    },
                    {
                        label: 'Register',
                        icon: 'pi pi-user-plus',
                        command: () => { navigate('/register'); setVisible(false); },
                        template: itemRenderer
                    }
                ])
            ]
        }
    ];

    return (
        <div className="card flex justify-content-center">
            <button
                onClick={() => setVisible(true)}
                className="p-2 rounded-md text-[#003366] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Open Menu"
            >
                <i className="pi pi-bars text-2xl"></i>
            </button>

            <Sidebar visible={visible} onHide={() => setVisible(false)} position="right" className="w-full md:w-20rem bg-white dark:bg-[#003366]">
                <Menu model={items} className="w-full border-none bg-transparent" />
            </Sidebar>
        </div>
    )
}
