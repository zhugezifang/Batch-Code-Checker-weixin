const brandOptions = require('../../utils/brands')
const visibleBrandLimit = 20

const monthNames = [
  '一月',
  '二月',
  '三月',
  '四月',
  '五月',
  '六月',
  '七月',
  '八月',
  '九月',
  '十月',
  '十一月',
  '十二月'
]

const yearMap = {
  A: 2026,
  B: 2005,
  C: 2006,
  D: 2007,
  E: 2008,
  F: 2009,
  G: 2010,
  H: 2011,
  I: 2012,
  J: 2012,
  K: 2013,
  L: 2014,
  M: 2015,
  N: 2016,
  P: 2017,
  R: 2018,
  S: 2019,
  T: 2020,
  U: 2021,
  V: 2021,
  W: 2022,
  X: 2023,
  Y: 2024,
  Z: 2025
}

const monthNumberMap = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  O: 10,
  0: 10,
  N: 11,
  D: 12
}

function searchBrands(keyword) {
  const normalizedKeyword = keyword.trim().toLowerCase()

  if (!normalizedKeyword) {
    return brandOptions.slice(0, visibleBrandLimit)
  }

  return brandOptions
    .filter((brand) => {
      return `${brand.label} ${brand.value}`.toLowerCase().includes(normalizedKeyword)
    })
    .slice(0, visibleBrandLimit)
}

function parseBatchCode(batchCode) {
  const normalizedCode = batchCode.trim().toUpperCase()
  let manufacturingDate
  let monthName
  let year

  if ((normalizedCode.length === 5 || normalizedCode.length === 6) && /^\d+$/.test(normalizedCode)) {
    const firstDigit = parseInt(normalizedCode.charAt(0), 10)
    const monthNum = parseInt(normalizedCode.substring(1, 3), 10)

    year = firstDigit > 2 ? firstDigit + 2010 : firstDigit + 2020

    if (monthNum === 0 || monthNum > 12) {
      return null
    }

    monthName = monthNames[monthNum - 1]
    manufacturingDate = new Date(year, monthNum - 1)
  } else if (/^[A-Z][A-Z]/i.test(normalizedCode.substring(0, 2)) && /^\d{3}$/.test(normalizedCode.substring(2, 5))) {
    year = yearMap[normalizedCode.charAt(1)]
    const dayOfYear = parseInt(normalizedCode.substring(2, 5), 10)

    if (!year || dayOfYear === 0 || dayOfYear > 365) {
      return null
    }

    manufacturingDate = new Date(year, 0)
    manufacturingDate.setDate(dayOfYear)
    monthName = monthNames[manufacturingDate.getMonth()]
  } else if (normalizedCode.length < 5 || normalizedCode.length > 10) {
    return null
  } else {
    year = yearMap[normalizedCode.charAt(2)]
    const monthNum = monthNumberMap[normalizedCode.charAt(3)]

    if (!year || !monthNum) {
      return null
    }

    manufacturingDate = new Date(year, monthNum - 1)
    monthName = monthNames[monthNum - 1]
  }

  const now = new Date()
  const monthsDiff = (now.getFullYear() - year) * 12 + now.getMonth() - manufacturingDate.getMonth()

  if (manufacturingDate > now || monthsDiff < 0) {
    return null
  }

  const years = Math.floor(monthsDiff / 12)
  const months = monthsDiff % 12
  const expiryDate = new Date(manufacturingDate)
  expiryDate.setFullYear(manufacturingDate.getFullYear() + 3)

  return {
    batchCode: normalizedCode,
    manufacturingDate: monthName,
    manufacturingYear: year,
    productAge: {
      years,
      months,
      yearsText: '年',
      monthsText: '个月'
    },
    isExpired: now > expiryDate,
    isValid: true
  }
}

function formatProductAge(productAge) {
  if (productAge.years === 0 && productAge.months === 0) {
    return '不到 1 个月'
  }

  const parts = []

  if (productAge.years > 0) {
    parts.push(`${productAge.years}${productAge.yearsText}`)
  }

  if (productAge.months > 0) {
    parts.push(`${productAge.months}${productAge.monthsText}`)
  }

  return parts.join(' ')
}

function queryBatch(brand, batchCode) {
  const parsedResult = parseBatchCode(batchCode)
  const normalizedCode = batchCode.trim().toUpperCase()

  if (!parsedResult) {
    return {
      brand: brand.label,
      brandValue: brand.value,
      batchCode: normalizedCode,
      status: 'fail',
      title: '未识别到有效批号',
      description: '请检查批号长度、字符位置，以及数字 5 和字母 S、数字 0 和字母 O 是否混淆。',
      checkedAt: new Date().toLocaleString()
    }
  }

  return {
    ...parsedResult,
    brand: brand.label,
    brandValue: brand.value,
    status: parsedResult.isExpired ? 'fail' : 'pass',
    title: parsedResult.isExpired ? '产品可能已过期' : '批号解析成功',
    productionText: `${parsedResult.manufacturingYear}年${parsedResult.manufacturingDate}`,
    ageText: formatProductAge(parsedResult.productAge),
    description: parsedResult.isExpired
      ? '按生产日期起 3 年有效期估算，该产品可能已经超过建议使用期限。'
      : '按生产日期起 3 年有效期估算，该产品仍在常规建议使用期内。',
    checkedAt: new Date().toLocaleString()
  }
}

Page({
  data: {
    brandOptions,
    brandCount: brandOptions.length,
    filteredBrands: searchBrands(''),
    brandKeyword: '',
    brandName: '',
    selectedBrand: null,
    showBrandList: false,
    batchCode: '',
    result: null
  },

  onBrandFocus() {
    this.setData({
      showBrandList: true,
      filteredBrands: searchBrands(this.data.brandKeyword)
    })
  },

  onBrandInput(event) {
    const brandKeyword = event.detail.value

    this.setData({
      brandKeyword,
      brandName: '',
      selectedBrand: null,
      showBrandList: true,
      filteredBrands: searchBrands(brandKeyword),
      result: null
    })
  },

  noop() {},

  selectBrand(event) {
    const selectedBrand = this.data.brandOptions.find((brand) => {
      return brand.value === event.currentTarget.dataset.value
    })

    if (!selectedBrand) {
      return
    }

    this.setData({
      brandKeyword: selectedBrand.label,
      brandName: selectedBrand.label,
      selectedBrand,
      showBrandList: false,
      result: null
    })
  },

  closeBrandList() {
    if (!this.data.showBrandList) {
      return
    }

    this.setData({
      showBrandList: false
    })
  },

  onBatchInput(event) {
    this.setData({
      batchCode: event.detail.value,
      result: null
    })
  },

  handleQuery() {
    this.closeBrandList()

    if (!this.data.brandName) {
      wx.showToast({
        title: '请选择品牌',
        icon: 'none'
      })
      return
    }

    if (!this.data.selectedBrand) {
      wx.showToast({
        title: '品牌数据异常',
        icon: 'none'
      })
      return
    }

    if (!this.data.batchCode.trim()) {
      wx.showToast({
        title: '请输入批次号',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '查询中'
    })

    setTimeout(() => {
      wx.hideLoading()
      this.setData({
        result: queryBatch(this.data.selectedBrand, this.data.batchCode)
      })
    }, 300)
  }
})
