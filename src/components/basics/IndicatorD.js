import { C, B } from './Colors'
import { Box, Flex } from '@rebass/grid'
import React from 'react'


export default function IndicationD({ size, label, value, ...props }) {
  return <Flex
    {...props}
    justifyContent="space-between"
    style={{
      paddingBottom: 8,
      borderBottom: `thin solid rgb(112, 180, 63)`,
      fontSize: size
    }}>

    <Box
      mr="20px"
      style={{
        color: C
      }}>
      {label}
    </Box>

    <Box
      style={{
        color: B
      }}>
      {value}
    </Box>

  </Flex>
}
