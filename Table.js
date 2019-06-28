/*
* DOC: June 27, 2019 20:03 IST
* Owner & Author: astriskit<harry2office@gmail.com>
*/
import React from 'react'
import {
  Text,
  View,
  StyleSheet,
  Page,
  PDFDownloadLink
} from '@react-pdf/renderer'
import PropTypes from 'prop-types'

// Td is expected to be used with Tr and Table to make a table like in HTML
const Td = ({ children, style }) => (
  <View style={style}>
    <Text>{children}</Text>
  </View>
)
Td.propTypes = {
  style: PropTypes.object, // Look here for supported css properties and values - https://react-pdf.org/styling#valid-css-properties
  children: PropTypes.node // Only use these components - https://react-pdf.org/components - but except Document and Page.
}
const Tr = ({ children, style }) => <View style={style}>{children}</View>
Tr.propTypes = {
  style: PropTypes.object, // Look here for supported css properties and values - https://react-pdf.org/styling#valid-css-properties
  children: PropTypes.arrayOf(PropTypes.element) // Use Tr as tr in html
}
const Table = ({
  dataSource,
  columns,
  headerRowStyle = {},
  tableStyle = {},
  cellStyle = {},
  headerCellStyle = {},
  rowStyle = {},
  tableBorder = 1,
  tableHzMargin = 10,
  tableVtMargin = 10,
  tablePadding = 0,
  cellHzPadding = 2,
  cellVtPadding = 2,
  renderer: { onHeaderCell = null, onCell = null } = {}
}) => {
  if (!dataSource) return <View />
  const cellWidth = `${100 / columns.length}%`
  const tableStyles = StyleSheet.create({
    table: {
      ...tableStyle,
      marginHorizontal: tableHzMargin,
      marginVertical: tableVtMargin,
      fontSize: '10pt',
      padding: tablePadding,
      border: tableBorder
    },
    row: { ...rowStyle, flexDirection: 'row', borderBottom: tableBorder },
    lastRow: {
      borderBottom: 0
    },
    col: {
      ...cellStyle,
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
    headerRow: {
      fontWeight: 800,
      ...headerRowStyle
    }
  })
  return (
    <View style={tableStyles.table}>
      <Tr
        style={{ ...tableStyles.headerRow, ...tableStyles.row }}
        key="header-row"
      >
        {columns.map((col, ind) => {
          let header = col['title'] || col['dataIndex']
          return (
            <Td
              key={`header-cell-${header}`}
              style={{
                ...headerCellStyle,
                ...tableStyles.col,
                ...(ind === columns.length - 1
                  ? tableStyles.lastCol
                  : ind === 0
                    ? tableStyles.firstCol
                    : {}),
                ...(col['align'] ? { textAlign: col['align'] } : {}),
                ...(col['justifyContent']
                  ? { textAlign: col['justifyContent'] }
                  : {})
              }}
            >
              {onHeaderCell ? onHeaderCell(col) : header}
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
                  {onCell ? onCell(rec) : rec[dataIndex]}
                </Td>
              )
            })}
          </Tr>
        )
      })}
    </View>
  )
}
Table.propTypes = {
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired, // One object represent one record with property-name defined by columns prop
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      dataIndex: PropTypes.string.isRequired,
      align: PropTypes.string, // see css align property
      justifyContent: PropTypes.string // see css justify-content property
    })
  ).isRequired,
  // restricted styling of various inner children of the table
  headerRowStyle: PropTypes.object,
  tableStyle: PropTypes.object,
  cellStyle: PropTypes.object,
  headerCellStyle: PropTypes.object,
  rowStyle: PropTypes.object,
  // collective styling of the table
  tableBorder: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  tableHzMargin: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  tableVtMargin: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  tablePadding: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  cellHzPadding: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  cellVtPadding: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  // for facilitating an element inside and header-cell or row-cell
  renderer: PropTypes.shape({
    onCell: PropTypes.func, // for row-cell
    onHeaderCell: PropTypes.func // for header-cell
  })
}
const PagedTable = ({
  tableProps: { dataSource = [], columns, ...restTableProps },
  style = {},
  perPage = 20,
  footerStyle,
  ...rest
}) => {
  let pages = []
  for (let i = 0; i < dataSource.length; i += perPage) {
    pages.push(
      <Page key={i} {...rest}>
        <Table
          dataSource={dataSource.slice(i, i + perPage)}
          columns={columns}
          style={style}
          {...restTableProps}
        />
        <Text
          style={footerStyle}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    )
  }
  return pages
}
PagedTable.propTypes = {
  tableProps: PropTypes.object.isRequired, // various table props
  style: PropTypes.object, // style properties
  perPage: PropTypes.number, // defines record in each page; optimised
  footerStyle: PropTypes.object // style property for the page-footer showing page numbers
}
const ExportPDF = ({
  loader,
  style = {},
  document,
  fileName = 'reports.pdf',
  errorTitle,
  loading,
  title
}) => {
  if (loading) return loader || null
  return (
    <PDFDownloadLink style={style} document={document} fileName={fileName}>
      {({
        // blob, url,
        loading,
        error
      }) => {
        if (error) {
          return errorTitle || 'Error!'
        }
        return loading
          ? loader || 'Loading document...'
          : title || 'Download now!'
      }}
    </PDFDownloadLink>
  )
}
ExportPDF.propTypes = {
  loader: PropTypes.node, // a spinner like element
  loading: PropTypes.bool, // shows if the async action is being completed
  document: PropTypes.element, // A Document from @react-pdf/renderer
  errorTile: PropTypes.string, // string indicating error
  title: PropTypes.string // string that shows when pdf is ready to be downloaded
}

export { PagedTable, ExportPDF, Table }
