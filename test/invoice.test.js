const test = require('node:test');
const assert = require('node:assert');

const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

function line(id, name, price, qty, hsn) {
  return { id, name, sku: 'TEST-' + id, price, qty, hsn, gstRate: undefined };
}

const cases = [
  {
    name: '1001',
    items: [
      line(8, 'Assam CTC Masala Chai 250g', 140, 2, '0902'),
      line(2, 'Unpolished Toor Dal 1kg', 165, 2, '0713')
    ],
    coupon: '',
    invoice: { subtotal: 610, discount: 0, tax: 66.9, total: 676.9, gst: [18, 5] },
    checkout: { subtotal: 610, discount: 0, tax: 66.9, total: 676.9 }
  },
  {
    name: '1002',
    items: [
      line(1, 'Indrayani Basmati Rice 5kg', 640, 1, '1006'),
      line(4, 'Cold-Pressed Sunflower Oil 1L', 190, 2, '1512')
    ],
    coupon: 'SAVE10',
    invoice: { subtotal: 1020, discount: 102, tax: 45.9, total: 963.9, gst: [5, 5] },
    checkout: { subtotal: 1020, discount: 102, tax: 45.9, total: 963.9 }
  },
  {
    name: '1004',
    items: [
      line(5, 'Cold-Pressed Groundnut Oil 5L', 1120, 2, '1508')
    ],
    coupon: 'SAVE10',
    invoice: { subtotal: 2240, discount: 150, tax: 104.5, total: 2194.5, gst: [5] },
    checkout: { subtotal: 2240, discount: 150, tax: 104.5, total: 2194.5 }
  },
  {
    name: '1008',
    items: [
      line(8, 'Assam CTC Masala Chai 250g', 140, 1, '0902'),
      line(12, 'Kokum Sherbet Concentrate 750ml', 180, 2, '2106')
    ],
    coupon: '',
    invoice: { subtotal: 500, discount: 0, tax: 90, total: 590, gst: [18, 18] },
    checkout: { subtotal: 500, discount: 0, tax: 90, total: 590 }
  }
];

for (const scenario of cases) {
  test('CURRENT BEHAVIOUR: invoice figures for order #' + scenario.name, function () {
    const order = { items: scenario.items, coupon: scenario.coupon };
    const invoiceFigures = invoice.computeInvoiceFigures(order);
    const checkoutFigures = pricing.computeTotals(scenario.items, scenario.coupon);

    assert.deepStrictEqual({
      subtotal: invoiceFigures.subtotal,
      discount: invoiceFigures.discount,
      tax: invoiceFigures.tax,
      total: invoiceFigures.total,
      gst: invoiceFigures.rows.map(function (row) { return row.gstPercent; })
    }, scenario.invoice);

    assert.deepStrictEqual({
      subtotal: checkoutFigures.subtotal,
      discount: checkoutFigures.discount,
      tax: checkoutFigures.tax,
      total: checkoutFigures.total
    }, scenario.checkout);
  });
}

test('CURRENT BEHAVIOUR: invoice and checkout match for the three ticket orders', function () {
  for (const scenario of cases.slice(0, 3)) {
    const invoiceFigures = invoice.computeInvoiceFigures({
      items: scenario.items,
      coupon: scenario.coupon
    });
    const checkoutFigures = pricing.computeTotals(scenario.items, scenario.coupon);

    assert.deepStrictEqual(
      { discount: invoiceFigures.discount, tax: invoiceFigures.tax, total: invoiceFigures.total },
      { discount: checkoutFigures.discount, tax: checkoutFigures.tax, total: checkoutFigures.total }
    );
  }
});

test('CURRENT BEHAVIOUR: invoice and checkout match for order #1008', function () {
  const scenario = cases[3];
  const invoiceFigures = invoice.computeInvoiceFigures({
    items: scenario.items,
    coupon: scenario.coupon
  });
  const checkoutFigures = pricing.computeTotals(scenario.items, scenario.coupon);

  assert.deepStrictEqual(
    { discount: invoiceFigures.discount, tax: invoiceFigures.tax, total: invoiceFigures.total },
    { discount: checkoutFigures.discount, tax: checkoutFigures.tax, total: checkoutFigures.total }
  );
});

test('invoice matches checkout GST and totals for all ticket examples', function () {
  for (const scenario of cases) {
    const invoiceFigures = invoice.computeInvoiceFigures({
      items: scenario.items,
      coupon: scenario.coupon
    });
    const checkoutFigures = pricing.computeTotals(scenario.items, scenario.coupon);

    assert.deepStrictEqual({
      subtotal: invoiceFigures.subtotal,
      discount: invoiceFigures.discount,
      tax: invoiceFigures.tax,
      total: invoiceFigures.total,
      lines: invoiceFigures.rows.map(function (row) {
        return { gstPercent: row.gstPercent, lineTax: row.lineTax };
      })
    }, {
      subtotal: checkoutFigures.subtotal,
      discount: checkoutFigures.discount,
      tax: checkoutFigures.tax,
      total: checkoutFigures.total,
      lines: checkoutFigures.lines.map(function (line) {
        return { gstPercent: line.gstPercent, lineTax: line.tax };
      })
    });
  }
});
