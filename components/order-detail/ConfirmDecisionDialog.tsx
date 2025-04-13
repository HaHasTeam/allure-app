import { Feather } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Dialog, PanningProvider } from 'react-native-ui-lib'

import ViewMediaSection from '../media/ViewMediaSection'
import SectionCollapsable from '../section-collapsable'

import { myTheme } from '@/constants'
import { RequestStatusEnum } from '@/types/enum'
import { TServerFile } from '@/types/file'

interface ConfirmDecisionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: string
  title?: string
  description?: string
  status: RequestStatusEnum
  rejectStatus?: RequestStatusEnum
  reasonRejected?: string | null
  isRejectRequest?: boolean
  reason?: string
  rejectReason?: string
  mediaFiles?: TServerFile[]
  rejectMediaFiles?: TServerFile[]
  rejectTime?: string
  returnTime?: string
  reviewTime?: string
}

export default function ConfirmDecisionDialog({
  open,
  onOpenChange,
  item,
  title,
  description,
  mediaFiles = [],
  reason,
  isRejectRequest,
  rejectReason,
  rejectMediaFiles,
  rejectStatus,
  status,
  reasonRejected,
  rejectTime,
  returnTime,
  reviewTime
}: ConfirmDecisionDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog
      visible={open}
      onDismiss={() => onOpenChange(false)}
      panDirection={PanningProvider.Directions.DOWN}
      containerStyle={styles.dialogContainer}
    >
      <View style={styles.contentContainer}>
        <FlatList
          style={styles.scrollArea}
          data={[1]}
          renderItem={() => (
            <View style={styles.content}>
              <View style={styles.header}>
                <Feather name='info' style={styles.infoIcon} size={24} color={myTheme.primary} />
                <View style={styles.headerContent}>
                  <Text style={styles.dialogTitle}>{title ?? t(`confirm.${item}.title`)}</Text>
                  <Text style={styles.dialogDescription}>{description ?? t(`confirm.${item}.description`)}</Text>
                </View>
              </View>

              <View style={styles.sectionsContainer}>
                <SectionCollapsable
                  header={
                    <View style={styles.sectionHeader}>
                      <Feather name='box' size={16} color={myTheme.primary} />
                      <Text style={styles.sectionHeaderText}>{t(`confirm.${item}.cus`)}</Text>
                    </View>
                  }
                  content={
                    <View style={styles.sectionContent}>
                      {returnTime && (
                        <View style={styles.itemRow}>
                          <Text style={styles.itemLabel}>{t('order.time')}:</Text>
                          <Text>
                            {t('date.toLocaleDateTimeString', {
                              val: new Date(returnTime)
                            })}
                          </Text>
                        </View>
                      )}
                      {reason && (
                        <View style={styles.itemRow}>
                          <Text style={styles.itemLabel}>{t('order.cancelOrderReason.reason')}:</Text>
                          <Text>{reason}</Text>
                        </View>
                      )}
                      {mediaFiles && mediaFiles?.length > 0 && (
                        <View style={styles.mediaContainer}>
                          <Text style={styles.itemLabel}>{t('order.proof')}</Text>
                          <ViewMediaSection mediaFiles={mediaFiles} />
                        </View>
                      )}
                    </View>
                  }
                />

                {isRejectRequest && (
                  <SectionCollapsable
                    header={
                      <View style={styles.sectionHeader}>
                        <Feather name='box' size={16} color={myTheme.primary} />
                        <Text style={styles.sectionHeaderText}>{t(`confirm.${item}.brand`)}</Text>
                      </View>
                    }
                    content={
                      <View style={styles.sectionContent}>
                        {(status === RequestStatusEnum.APPROVED || status === RequestStatusEnum.REJECTED) && (
                          <View style={styles.itemRow}>
                            <Text style={styles.itemLabel}>{t('return.decision')}:</Text>
                            <Text>
                              {status === RequestStatusEnum.APPROVED
                                ? t('requestStatus.approved')
                                : t('requestStatus.rejected')}
                            </Text>
                          </View>
                        )}
                        {rejectTime && (
                          <View style={styles.itemRow}>
                            <Text style={styles.itemLabel}>{t('order.time')}:</Text>
                            <Text>
                              {t('date.toLocaleDateTimeString', {
                                val: new Date(rejectTime)
                              })}
                            </Text>
                          </View>
                        )}
                        {rejectReason && (
                          <View style={styles.itemRow}>
                            <Text style={styles.itemLabel}>{t('order.cancelOrderReason.reason')}:</Text>
                            <Text>{rejectReason}</Text>
                          </View>
                        )}
                        {rejectMediaFiles && rejectMediaFiles?.length > 0 && (
                          <View style={styles.mediaContainer}>
                            <Text style={styles.itemLabel}>{t('order.proof')}</Text>
                            <ViewMediaSection mediaFiles={rejectMediaFiles} />
                          </View>
                        )}
                      </View>
                    }
                  />
                )}

                {rejectStatus && rejectStatus !== RequestStatusEnum.PENDING && (
                  <SectionCollapsable
                    header={
                      <View style={styles.sectionHeader}>
                        <Feather name='box' size={16} color={myTheme.primary} />
                        <Text style={styles.sectionHeaderText}>{t(`confirm.${item}.admin`)}</Text>
                      </View>
                    }
                    content={
                      <View style={styles.sectionContent}>
                        {(rejectStatus === RequestStatusEnum.APPROVED ||
                          rejectStatus === RequestStatusEnum.REJECTED) && (
                          <View style={styles.itemRow}>
                            <Text style={styles.itemLabel}>{t('return.decision')}:</Text>
                            <Text>
                              {rejectStatus === RequestStatusEnum.APPROVED
                                ? t('requestStatus.approved')
                                : t('requestStatus.rejected')}
                            </Text>
                          </View>
                        )}
                        {reviewTime && (
                          <View style={styles.itemRow}>
                            <Text style={styles.itemLabel}>{t('order.time')}:</Text>
                            <Text>
                              {t('date.toLocaleDateTimeString', {
                                val: new Date(reviewTime)
                              })}
                            </Text>
                          </View>
                        )}
                        {reasonRejected && (
                          <View style={styles.itemRow}>
                            <Text style={styles.itemLabel}>{t('order.cancelOrderReason.reason')}:</Text>
                            <Text>{reasonRejected}</Text>
                          </View>
                        )}
                      </View>
                    }
                  />
                )}
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.closeButton} onPress={() => onOpenChange(false)}>
                  <Text style={styles.closeButtonText}>{t('button.close')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </Dialog>
  )
}

const { width } = Dimensions.get('window')

const styles = StyleSheet.create({
  dialogContainer: {
    maxWidth: width * 0.9,
    maxHeight: '80%',
    borderRadius: 8
  },
  contentContainer: {
    flex: 1
  },
  scrollArea: {
    maxHeight: '80%'
  },
  content: {
    paddingVertical: 16,
    paddingHorizontal: 16
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 12
  },
  infoIcon: {
    marginTop: 8
  },
  headerContent: {
    flex: 1,
    gap: 8
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D4ED8' // Assuming primary color
  },
  dialogDescription: {
    fontSize: 16
  },
  sectionsContainer: {
    gap: 12
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  sectionHeaderText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#1D4ED8' // Assuming primary color
  },
  sectionContent: {
    gap: 8,
    paddingVertical: 8
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  itemLabel: {
    fontWeight: '500',
    color: '#1D4ED8' // Assuming primary color
  },
  mediaContainer: {
    gap: 8
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16
  },
  closeButton: {
    borderWidth: 1,
    borderColor: '#1D4ED8', // Assuming primary color
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4
  },
  closeButtonText: {
    color: '#1D4ED8' // Assuming primary color
  }
})
