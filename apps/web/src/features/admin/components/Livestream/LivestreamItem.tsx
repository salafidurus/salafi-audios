"use client";

import { Edit, Trash, Send, Globe, User } from "lucide-react";
import { PermissionGate } from "@/features/admin/components/permission-gate/permission-gate";
import { Button } from "@/shared/components/Button";
import { List } from "@/shared/components/List";
import { useFormattedDate } from "@/shared/hooks/use-formatted-date";
import { useResponsive } from "@/shared/hooks/use-responsive";
import type { LiveSessionPublicDto, LivestreamChannelDto } from "@sd/core-contracts";
import styles from "./livestream-item.module.css";

export interface LivestreamItemProps {
  type: "session" | "channel";
  item: LiveSessionPublicDto | LivestreamChannelDto;
  onEdit: () => void;
  onDelete: () => void;
}

function SessionDateItem({ dateStr, label }: { dateStr: string; label: string }) {
  const formatted = useFormattedDate(dateStr);
  return (
    <>
      <span className={styles.sep}>&bull;</span>
      <span className={styles.metaItem}>
        {label} {formatted}
      </span>
    </>
  );
}

export function LivestreamItem({ type, item, onEdit, onDelete }: LivestreamItemProps) {
  const { isMobile } = useResponsive();

  if (type === "session") {
    const session = item as LiveSessionPublicDto;
    const badgeClass =
      session.status === "live"
        ? styles.badgeLive
        : session.status === "scheduled"
          ? styles.badgeScheduled
          : styles.badgeEnded;

    return (
      <List.Item interactive className={styles.listItem}>
        <div className={styles.content}>
          <div className={styles.details}>
            <div className={styles.detailsBody}>
              <div className={styles.titleRow}>
                <h3 className={styles.title}>{session.title || "Untitled Session"}</h3>
                <span className={`${styles.badge} ${badgeClass}`}>{session.status}</span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.channel}>Channel: {session.channelDisplayName}</span>
                {session.telegramSlug && (
                  <>
                    <span className={styles.sep}>&bull;</span>
                    <span className={styles.telegram}>@{session.telegramSlug}</span>
                  </>
                )}
                {session.scholarName && (
                  <>
                    <span className={styles.sep}>&bull;</span>
                    <span className={styles.metaItem}>
                      <User
                        size={12}
                        style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }}
                      />
                      {session.scholarName}
                    </span>
                  </>
                )}
                {session.scheduledAt && (
                  <SessionDateItem dateStr={session.scheduledAt} label="Sched:" />
                )}
                {session.startedAt && (
                  <SessionDateItem dateStr={session.startedAt} label="Started:" />
                )}
              </div>
            </div>
          </div>
        </div>
        <List.Item.Actions>
          <PermissionGate requires="LIVE_EDIT">
            <Button
              variant={isMobile ? "outline" : "ghost"}
              size={isMobile ? "md" : "icon"}
              onClick={onEdit}
              aria-label="Edit Status"
              className={isMobile ? styles.editButtonMobile : undefined}
            >
              <Edit size={16} />
              {isMobile && " Status"}
            </Button>
          </PermissionGate>
          <PermissionGate requires="LIVE_DELETE">
            <Button
              variant={isMobile ? "outline" : "ghost"}
              size={isMobile ? "md" : "icon"}
              onClick={onDelete}
              aria-label="Delete Session"
              className={isMobile ? styles.deleteButtonMobile : undefined}
              style={{ color: "var(--state-danger)" }}
            >
              <Trash size={16} />
              {isMobile && " Delete"}
            </Button>
          </PermissionGate>
        </List.Item.Actions>
      </List.Item>
    );
  } else {
    const channel = item as LivestreamChannelDto;
    const badgeClass = channel.isActive ? styles.badgeActive : styles.badgeInactive;

    return (
      <List.Item interactive className={styles.listItem}>
        <div className={styles.content}>
          <div className={styles.details}>
            <div className={styles.detailsBody}>
              <div className={styles.titleRow}>
                <h3 className={styles.title}>{channel.displayName}</h3>
                <span className={`${styles.badge} ${badgeClass}`}>
                  {channel.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className={styles.metaRow}>
                {channel.telegramSlug && (
                  <span className={styles.metaItem}>
                    <Send
                      size={12}
                      style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }}
                    />
                    @{channel.telegramSlug}
                  </span>
                )}
                {channel.language && (
                  <>
                    <span className={styles.sep}>&bull;</span>
                    <span className={styles.metaItem}>
                      <Globe
                        size={12}
                        style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }}
                      />
                      {channel.language.toUpperCase()}
                    </span>
                  </>
                )}
                {channel.scholarName && (
                  <>
                    <span className={styles.sep}>&bull;</span>
                    <span className={styles.metaItem}>
                      <User
                        size={12}
                        style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }}
                      />
                      {channel.scholarName}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <List.Item.Actions>
          <PermissionGate requires="LIVE_EDIT">
            <Button
              variant={isMobile ? "outline" : "ghost"}
              size={isMobile ? "md" : "icon"}
              onClick={onEdit}
              aria-label="Edit Channel"
              className={isMobile ? styles.editButtonMobile : undefined}
            >
              <Edit size={16} />
              {isMobile && " Edit"}
            </Button>
          </PermissionGate>
          <PermissionGate requires="LIVE_DELETE">
            <Button
              variant={isMobile ? "outline" : "ghost"}
              size={isMobile ? "md" : "icon"}
              onClick={onDelete}
              aria-label="Delete Channel"
              className={isMobile ? styles.deleteButtonMobile : undefined}
              style={{ color: "var(--state-danger)" }}
            >
              <Trash size={16} />
              {isMobile && " Delete"}
            </Button>
          </PermissionGate>
        </List.Item.Actions>
      </List.Item>
    );
  }
}
