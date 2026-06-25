'use client';

import { useCallback, useMemo, useState, FormEvent } from 'react';
import useSWR from 'swr';
import { useClickOutside } from '@mantine/hooks';
import { useRouter, useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { useT } from '@gitroom/react/translation/get.transation.service.client';

type Client = {
  id: string;
  name: string;
  picture?: string | null;
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const ClientAvatar = ({
  client,
  className,
}: {
  client?: Client;
  className?: string;
}) => {
  if (!client) {
    return (
      <img
        src="/woodstock-wifi-mark-dark-bg.svg"
        alt=""
        aria-hidden="true"
        className={clsx('object-contain', className || 'w-[46px] h-auto')}
      />
    );
  }

  return (
    <div
      className={clsx(
        'relative flex items-center justify-center rounded-[10px] bg-newTableHeader text-[12px] font-[700] uppercase text-newTextColor overflow-hidden',
        className
      )}
    >
      {getInitials(client.name)}
      {!!client.picture && (
        <img
          src={client.picture}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      )}
    </div>
  );
};

const ClientWorkspaceModal = ({
  client,
  onSaved,
}: {
  client?: Client;
  onSaved: (client: Client) => void;
}) => {
  const fetch = useFetch();
  const modal = useModals();
  const toast = useToaster();
  const t = useT();
  const [name, setName] = useState(client?.name || '');
  const [picture, setPicture] = useState(client?.picture || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const uploadLogo = useCallback(
    async (file?: File) => {
      if (!file) {
        return;
      }

      setUploading(true);
      setError('');

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('preventSave', 'true');

        const response = await fetch('/media/upload-simple', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Could not upload logo');
        }

        const data = await response.json();
        const uploadedPath = data.path || '';
        setPicture(uploadedPath);

        if (client && name.trim() && uploadedPath) {
          const updateResponse = await fetch(
            `/integrations/customers/${client.id}`,
            {
              method: 'PUT',
              body: JSON.stringify({
                name: name.trim(),
                picture: uploadedPath,
              }),
            }
          );

          if (!updateResponse.ok) {
            throw new Error('Could not save uploaded logo');
          }

          const savedClient = await updateResponse.json();
          onSaved(savedClient);
          toast.show(t('logo_uploaded', 'Logo uploaded'), 'success');
          modal.closeCurrent();
          return;
        }

        toast.show(t('logo_uploaded', 'Logo uploaded'), 'success');
      } catch {
        setError(
          t(
            'logo_upload_failed',
            'Could not upload this logo. Try a PNG, JPG, WebP or GIF under 10 MB.'
          )
        );
      } finally {
        setUploading(false);
      }
    },
    [client, fetch, modal, name, onSaved, t, toast]
  );

  const submit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmedName = name.trim();
      const trimmedPicture = picture.trim();

      if (!trimmedName) {
        setError(t('client_name_required', 'Client name is required'));
        return;
      }

      setSaving(true);
      setError('');

      try {
        const response = await fetch(
          client
            ? `/integrations/customers/${client.id}`
            : '/integrations/customers',
          {
            method: client ? 'PUT' : 'POST',
            body: JSON.stringify({
              name: trimmedName,
              picture: trimmedPicture,
            }),
          }
        );

        if (!response.ok) {
          throw new Error('Could not create client');
        }

        const savedClient = await response.json();
        onSaved(savedClient);
        toast.show(
          client
            ? t('client_updated', 'Client updated')
            : t('client_created', 'Client created'),
          'success'
        );
        modal.closeCurrent();
      } catch {
        setError(
          t('client_save_failed', 'Could not save this client workspace')
        );
      } finally {
        setSaving(false);
      }
    },
    [client, fetch, modal, name, onSaved, picture, t, toast]
  );

  return (
    <form className="flex flex-col gap-[14px] pt-[4px]" onSubmit={submit}>
      <div className="flex flex-col gap-[6px]">
        <label className="text-[13px] font-[600] text-textColor">
          {t('client_name', 'Client name')}
        </label>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="h-[44px] rounded-[8px] border border-tableBorder bg-input text-textColor px-[12px] outline-none"
          placeholder={t('client_name_placeholder', 'Acme Studio')}
          autoFocus
        />
      </div>
      <div className="flex flex-col gap-[6px]">
        <label className="text-[13px] font-[600] text-textColor">
          {t('client_logo_url', 'Logo URL')}
        </label>
        <div className="flex items-center gap-[10px]">
          <ClientAvatar
            client={
              picture
                ? {
                    id: client?.id || 'preview',
                    name: name || t('client', 'Client'),
                    picture,
                  }
                : undefined
            }
            className="h-[44px] w-[44px] shrink-0"
          />
          <input
            value={picture}
            onChange={(event) => setPicture(event.target.value)}
            className="h-[44px] min-w-0 flex-1 rounded-[8px] border border-tableBorder bg-input text-textColor px-[12px] outline-none"
            placeholder="https://..."
          />
        </div>
        <div className="flex items-center gap-[10px]">
          <label className="flex h-[38px] cursor-pointer items-center justify-center rounded-[8px] bg-newTableHeader px-[12px] text-[13px] font-[700] text-textColor transition-colors hover:bg-tableBorder">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/bmp,image/tiff"
              className="hidden"
              disabled={uploading}
              onChange={(event) => {
                uploadLogo(event.target.files?.[0]);
                event.target.value = '';
              }}
            />
            {uploading
              ? t('uploading_logo', 'Uploading...')
              : t('upload_logo', 'Upload logo')}
          </label>
          <span className="text-[12px] text-textItemBlur">
            {t('logo_upload_hint', 'PNG, JPG, WebP or GIF. Max 10 MB.')}
          </span>
        </div>
      </div>
      {!!error && <div className="text-[13px] text-red-500">{error}</div>}
      <div className="flex gap-[10px] pt-[4px]">
        <button
          type="button"
          className="h-[42px] flex-1 rounded-[8px] border border-tableBorder text-textColor"
          onClick={() => modal.closeCurrent()}
        >
          {t('cancel', 'Cancel')}
        </button>
        <button
          type="submit"
          disabled={saving}
          className="h-[42px] flex-1 rounded-[8px] bg-[#ff2364] px-[16px] font-[700] text-white transition-colors hover:bg-[#d81b52] disabled:opacity-60"
        >
          {saving
            ? t('saving', 'Saving...')
            : client
            ? t('update_client', 'Update client')
            : t('create_client', 'Create client')}
        </button>
      </div>
    </form>
  );
};

export const Logo = () => {
  const fetch = useFetch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const modal = useModals();
  const t = useT();
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

  const loadClients = useCallback(
    async (path: string) => {
      return (await (await fetch(path)).json()) as Client[];
    },
    [fetch]
  );

  const { data: clients = [], mutate } = useSWR(
    '/integrations/customers',
    loadClients,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      fallbackData: [],
    }
  );

  const selectedClientId = searchParams.get('customer') || '';
  const selectedClient = useMemo(
    () => clients.find((client) => client.id === selectedClientId),
    [clients, selectedClientId]
  );

  const selectClient = useCallback(
    (client?: Client) => {
      setOpen(false);
      router.push(client ? `/launches?customer=${client.id}` : '/launches');
    },
    [router]
  );

  const openClientModal = useCallback(
    (client?: Client) => {
      setOpen(false);
      modal.openModal({
        title: client
          ? t('edit_client_workspace', 'Edit client workspace')
          : t('create_client_workspace', 'Create client workspace'),
        withCloseButton: true,
        children: (
          <ClientWorkspaceModal
            client={client}
            onSaved={(savedClient) => {
              mutate();
              selectClient(savedClient);
            }}
          />
        ),
      });
    },
    [modal, mutate, selectClient, t]
  );

  const openCreateClient = useCallback(() => {
    setOpen(false);
    openClientModal();
  }, [openClientModal]);

  return (
    <div
      ref={ref}
      className="relative mt-[8px] w-full h-[58px] min-h-[58px] flex items-center justify-center"
    >
      <button
        type="button"
        aria-label={t('select_client_tooltip', 'Select client')}
        data-tooltip-id="tooltip"
        data-tooltip-content={
          selectedClient
            ? `${t('client', 'Client')}: ${selectedClient.name}`
            : t('select_client_tooltip', 'Select client')
        }
        className="relative h-[54px] w-[58px] rounded-[12px] flex flex-col items-center justify-center gap-[2px] transition-colors hover:bg-newTableHeader"
        onClick={() => setOpen((value) => !value)}
      >
        <div className="relative">
          <ClientAvatar client={selectedClient} className="h-[36px] w-[36px]" />
        </div>
        <span className="text-[9px] font-[700] leading-none text-textItemBlur">
          {t('client', 'Client')}
        </span>
      </button>

      {open && (
        <div className="fixed left-[86px] top-[20px] z-[9999] w-[288px] rounded-[12px] border border-tableBorder bg-newBgColorInner p-[8px] shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
          <div className="px-[8px] pb-[8px] pt-[4px] text-[12px] font-[700] uppercase tracking-[0.08em] text-textItemBlur">
            {t('client_workspace', 'Client workspace')}
          </div>
          <button
            type="button"
            className={clsx(
              'flex w-full items-center gap-[10px] rounded-[8px] px-[10px] py-[9px] text-start text-[14px] transition-colors hover:bg-newTableHeader',
              !selectedClient && 'bg-newTableHeader text-newTextColor'
            )}
            onClick={() => selectClient()}
          >
            <ClientAvatar className="h-[34px] w-[34px]" />
            <div className="flex min-w-0 flex-col">
              <span className="line-clamp-1 font-[700]">
                {t('all_clients', 'All clients')}
              </span>
              <span className="line-clamp-1 text-[12px] text-textItemBlur">
                {t('all_clients_description', 'Full agency view')}
              </span>
            </div>
          </button>

          <div className="my-[8px] h-[1px] bg-tableBorder" />

          <div className="max-h-[260px] overflow-y-auto pr-[2px]">
            {clients.map((client) => (
              <div
                key={client.id}
                className={clsx(
                  'flex w-full items-center gap-[6px] rounded-[8px] px-[10px] py-[9px] text-start text-[14px] transition-colors hover:bg-newTableHeader',
                  selectedClient?.id === client.id &&
                    'bg-newTableHeader text-newTextColor'
                )}
              >
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-[10px] text-start"
                  onClick={() => selectClient(client)}
                >
                  <ClientAvatar client={client} className="h-[34px] w-[34px]" />
                  <span className="line-clamp-1 font-[700]">{client.name}</span>
                </button>
                <button
                  type="button"
                  aria-label={t(
                    'edit_client_workspace',
                    'Edit client workspace'
                  )}
                  data-tooltip-id="tooltip"
                  data-tooltip-content={t(
                    'edit_client_workspace',
                    'Edit client workspace'
                  )}
                  className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[7px] text-textItemBlur transition-colors hover:bg-tableBorder hover:text-newTextColor"
                  onClick={() => openClientModal(client)}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 20H21"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M16.5 3.5C17.3284 2.67157 18.6716 2.67157 19.5 3.5C20.3284 4.32843 20.3284 5.67157 19.5 6.5L7 19L3 20L4 16L16.5 3.5Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="mt-[8px] flex h-[40px] w-full items-center justify-center rounded-[8px] bg-[#ff2364] px-[12px] text-[14px] font-[700] text-white transition-colors hover:bg-[#d81b52]"
            onClick={openCreateClient}
          >
            {t('add_client', 'Add client')}
          </button>
        </div>
      )}
    </div>
  );
};
