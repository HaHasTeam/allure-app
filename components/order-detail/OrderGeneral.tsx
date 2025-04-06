import { CircleChevronDown, CircleChevronUp } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '../ui/button'

interface OrderGeneralProps {
  title: string
  icon: React.ReactElement
  content: React.ReactElement
  status?: 'normal' | 'success' | 'warning' | 'danger'
}

const OrderGeneral = ({ title, icon, content, status = 'normal' }: OrderGeneralProps) => {
  const [expanded, setExpanded] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (contentRef.current) {
      setIsOverflowing(contentRef.current.scrollHeight > contentRef.current.clientHeight)
    }
  }, [content])

  let color = ''
  let borderColor = ''
  switch (status) {
    case 'normal': // for default
      color = 'primary'
      borderColor = 'primary/40'
      break
    case 'danger':
      color = 'red-500'
      borderColor = 'red-300'
      break
    case 'success':
      color = 'green-500'
      borderColor = 'green-300'
      break
    case 'warning':
      color = 'yellow-500'
      borderColor = 'yellow-300'
      break
    default:
      color = 'gray-500'
      borderColor = 'gray-300'
      break
  }
  return (
    <div className={`w-full bg-card rounded-md border border-${borderColor} p-4 space-y-2 shadow-sm`}>
      <div className={`flex gap-2 text-${color} items-center`}>
        {icon}
        <span className="text-base md:text-lg font-medium">{title}</span>
      </div>
      <div className="relative">
        <div
          ref={contentRef}
          className={`text-muted-foreground transition-all duration-300 ${expanded ? 'max-h-none' : 'max-h-44 overflow-hidden'}`}
        >
          {content}
        </div>
        {!expanded && isOverflowing && (
          <div className="z-0 absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-background to-transparent"></div>
        )}
        {isOverflowing &&
          (expanded ? (
            <div className="w-full flex justify-center">
              <Button
                variant="outline"
                onClick={() => setExpanded(!expanded)}
                className="mt-2 text-primary text-sm font-medium hover:bg-card border-0 shadow-none hover:text-primary/80"
              >
                <CircleChevronUp size={18} />
              </Button>
            </div>
          ) : (
            <div className="absolute z-10 w-full flex justify-center">
              <Button
                variant="outline"
                onClick={() => setExpanded(!expanded)}
                className="mt-2 text-primary text-sm font-medium hover:bg-card border-0 shadow-none hover:text-primary/80"
              >
                <CircleChevronDown size={18} />
              </Button>
            </div>
          ))}
      </div>
    </div>
  )
}

export default OrderGeneral
