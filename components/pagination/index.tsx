import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { PageControl } from 'react-native-ui-lib'

interface APIPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (index: number) => void
}
const APIPagination = ({ currentPage, totalPages, onPageChange }: APIPaginationProps) => {
  return (
    <View>
      <PageControl numOfPages={totalPages} currentPage={currentPage} onPagePress={onPageChange} />
    </View>
  )
}

export default APIPagination

const styles = StyleSheet.create({})
