import { ReactElement } from 'react'
import { ExpandableSection } from 'react-native-ui-lib'

interface SectionCollapsableProps {
  header: ReactElement
  content: ReactElement
}
const SectionCollapsable = ({ header, content }: SectionCollapsableProps) => {
  return (
    <ExpandableSection expanded sectionHeader={header} onPress={() => console.log('pressed')}>
      {content}
    </ExpandableSection>
  )
}

export default SectionCollapsable
