import { C, B } from './Colors'
import { Box } from '@rebass/grid'
import React from 'react'
import Text from './Text'


export default function LabeledText({ label, text, transform, spacing, big }) {
	return <Box>
		<Box>
			<Text
				size={big ? "15px" : "13px"}
				color={C}>
				{label}
			</Text>
		</Box>
		<Box mt="2px">
			<Text
				size={big ? "18px" : "15px"}
				color={B}
				style={{
					textTransform: transform ? transform : "none",
					letterSpacing: spacing ? spacing : 0
				}}>
				{text}
			</Text>
		</Box>
	</Box>
}