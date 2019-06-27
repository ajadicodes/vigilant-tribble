import React from 'react'
import { Text, View, StyleSheet, Page } from '@react-pdf/renderer'
/*
* DOC: June 27, 2019 20:03 IST
* Owner & Author: astriskit<harry2office@gmail.com>
*/
const Td = ({ children, style }) => (
  <View style={style}>
    <Text>{children}</Text>
  </View>
)
const Tr = ({ children, style }) => <View style={style}>{children}</View>
const TablePDF = ({ dataSource, columns, style = {} }) => {
  if (!dataSource) return <View />
  const cellWidth = `${100 / columns.length}%`
  const tableBorder = 1
  const cellHzPadding = 2
  const cellVtPadding = 2
  const tableStyles = StyleSheet.create({
    table: {
      marginHorizontal: 10,
      marginVertical: 10,
      fontSize: '10pt',
      ...style,
      padding: 0,
      border: tableBorder
    },
    row: { flexDirection: 'row', borderBottom: tableBorder },
    lastRow: {
      borderBottom: 0
    },
    col: {
      width: cellWidth,
      borderLeft: tableBorder,
      textAlign: 'center',
      justifyContent: 'center',
      paddingHorizontal: cellHzPadding,
      paddingVertical: cellVtPadding
    },
    firstCol: {
      borderLeft: 0
    },
    lastCol: {
      borderRight: 0
    },
    header: {
      fontWeight: 800
    }
  })
  return (
    <View style={tableStyles.table}>
      <Tr
        style={{ ...tableStyles.row, ...tableStyles.header }}
        key="header-row"
      >
        {columns.map((col, ind) => {
          let header = col['title'] || col['dataIndex']
          return (
            <Td
              key={`header-cell-${header}`}
              style={{
                ...tableStyles.col,
                ...(ind === columns.length - 1
                  ? tableStyles.lastCol
                  : ind === 0
                    ? tableStyles.firstCol
                    : {}),
                ...(col['align'] ? { textAlign: col['align'] } : {})
              }}
            >
              {header}
            </Td>
          )
        })}
      </Tr>
      {dataSource.map((rec, recInd) => {
        return (
          <Tr
            key={recInd}
            style={{
              ...tableStyles.row,
              ...(recInd === dataSource.length - 1 ? tableStyles.lastRow : {})
            }}
          >
            {columns.map((col, ind) => {
              let dataIndex = col['dataIndex']
              return (
                <Td
                  key={`row-cell-${dataIndex}`}
                  style={{
                    ...tableStyles.col,
                    ...(ind === columns.length - 1
                      ? tableStyles.lastCol
                      : ind === 0
                        ? tableStyles.firstCol
                        : {}),
                    ...(col['align'] ? { textAlign: col['align'] } : {})
                  }}
                >
                  {rec[dataIndex]}
                </Td>
              )
            })}
          </Tr>
        )
      })}
    </View>
  )
}

const PagedTablePDF = ({
  dataSource = [],
  columns,
  style = {},
  perPage = 20,
  footerStyle,
  ...rest
}) => {
  let pages = []
  for (let i = 0; i < dataSource.length; i += perPage) {
    pages.push(
      <Page key={i} {...rest}>
        <TablePDF
          dataSource={dataSource.slice(i, i + perPage)}
          columns={columns}
          style={style}
        />
        <Text
        style={footerStyle}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
      </Page>
    )
  }
  return pages
}

export { PagedTablePDF }
export default TablePDF
