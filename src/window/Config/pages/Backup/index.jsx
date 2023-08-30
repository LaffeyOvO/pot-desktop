import { readTextFile, BaseDirectory } from '@tauri-apps/api/fs';
import { DropdownTrigger } from '@nextui-org/react';
import { useDisclosure } from '@nextui-org/react';
import toast, { Toaster } from 'react-hot-toast';
import { DropdownMenu } from '@nextui-org/react';
import { DropdownItem } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';
import { CardBody } from '@nextui-org/react';
import { Dropdown } from '@nextui-org/react';
import { Button } from '@nextui-org/react';
import { Input } from '@nextui-org/react';
import { Card } from '@nextui-org/react';
import { invoke } from '@tauri-apps/api';
import React, { useState } from 'react';

import { useConfig, useToastStyle } from '../../../../hooks';
import WebDavModal from './WebDavModal';

export default function Backup() {
    const [backupType, setBackupType] = useConfig('backup_type', 'webdav');
    const [davUserName, setDavUserName] = useConfig('webdav_username', '');
    const [davPassword, setDavPassword] = useConfig('webdav_password', '');
    const [davUrl, setDavUrl] = useConfig('webdav_url', '');
    const {
        isOpen: isWebDavListOpen,
        onOpen: onWebDavListOpen,
        onOpenChange: onWebDavListOpenChange,
    } = useDisclosure();
    const [uploading, setUploading] = useState(false);
    const toastStyle = useToastStyle();
    const { t } = useTranslation();

    return (
        <Card style={{ marginBottom: '10px' }}>
            <Toaster />
            <CardBody>
                <div className='config-item'>
                    <h3 style={{ margin: 'auto 0' }}>{t('config.backup.type')}</h3>
                    {backupType !== null && (
                        <Dropdown>
                            <DropdownTrigger>
                                <Button variant='bordered'>{t(`config.backup.${backupType}`)}</Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                aria-label='backup type'
                                onAction={(key) => {
                                    setBackupType(key);
                                }}
                            >
                                <DropdownItem key='webdav'>{t('config.backup.webdav')}</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    )}
                </div>
                <div className={backupType !== 'webdav' ? 'hidden' : ''}>
                    <div className='config-item'>
                        <h3 style={{ margin: 'auto 0' }}>{t('config.backup.url')}</h3>
                        {davUrl !== null && (
                            <Input
                                variant='bordered'
                                value={davUrl}
                                onValueChange={(v) => {
                                    setDavUrl(v);
                                }}
                                className='max-w-[300px]'
                            />
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 style={{ margin: 'auto 0' }}>{t('config.backup.username')}</h3>
                        {davUserName !== null && (
                            <Input
                                variant='bordered'
                                value={davUserName}
                                onValueChange={(v) => {
                                    setDavUserName(v);
                                }}
                                className='max-w-[300px]'
                            />
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 style={{ margin: 'auto 0' }}>{t('config.backup.password')}</h3>
                        {davPassword !== null && (
                            <Input
                                type='password'
                                variant='bordered'
                                value={davPassword}
                                onValueChange={(v) => {
                                    setDavPassword(v);
                                }}
                                className='max-w-[300px]'
                            />
                        )}
                    </div>
                    <div className='flex justify-around'>
                        <Button
                            color='success'
                            variant='flat'
                            isLoading={uploading}
                            onPress={() => {
                                setUploading(true);
                                const time = new Date();
                                readTextFile('config.json', { dir: BaseDirectory.AppConfig }).then(
                                    (v) => {
                                        invoke('put_backup', {
                                            url: davUrl,
                                            username: davUserName,
                                            password: davPassword,
                                            name: `${time.getFullYear()}-${time.getMonth()}-${time.getDate()}-${time.getHours()}-${time.getMinutes()}-${time.getSeconds()}.json`,
                                            body: v,
                                        }).then(
                                            () => {
                                                toast.success(t('config.backup.backup_success'), { style: toastStyle });
                                                setUploading(false);
                                            },
                                            (e) => {
                                                toast.error(e.toString(), { style: toastStyle });
                                                setUploading(false);
                                            }
                                        );
                                    },
                                    (e) => {
                                        toast.error(e.toString(), { style: toastStyle });
                                        setUploading(false);
                                    }
                                );
                            }}
                        >
                            {t('config.backup.backup')}
                        </Button>
                        <Button
                            color='secondary'
                            variant='flat'
                            onPress={onWebDavListOpen}
                        >
                            {t('config.backup.show')}
                        </Button>
                    </div>
                </div>
            </CardBody>
            <WebDavModal
                isOpen={isWebDavListOpen}
                onOpenChange={onWebDavListOpenChange}
                url={davUrl}
                username={davUserName}
                password={davPassword}
            />
        </Card>
    );
}