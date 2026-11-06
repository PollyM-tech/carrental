import test from 'node:test';
import assert from 'node:assert/strict';
import {bookingWhatsAppUrl} from '../src/lib/booking-whatsapp.ts';
test('saved booking WhatsApp links use the fixed business number and preserve special characters',()=>{
 const link=new URL(bookingWhatsAppUrl({reference:'saved-booking-123',name:'A&B + traveller',email:'guest@example.com',phone:'+447700900123',vehicle:'Toyota Axio',pickupDate:'2026-12-01',returnDate:'2026-12-03',pickupLocation:'Airport & Terminal 1'}));
 assert.equal(link.origin,'https://wa.me');assert.equal(link.pathname,'/254716741039');
 const text=link.searchParams.get('text');for(const value of ['saved-booking-123','A&B + traveller','+447700900123','Toyota Axio','2026-12-01','Airport & Terminal 1'])assert.ok(text.includes(value));
 assert.ok(text.includes('No payment or reservation is confirmed'));
});
test('general enquiries include their saved reference and omit absent fields',()=>{
 const text=new URL(bookingWhatsAppUrl({kind:'general',reference:'lead-123',phone:'+254716741039',message:'Please call me.'})).searchParams.get('text');
 assert.ok(text.includes('submitted an enquiry'));assert.ok(text.includes('lead-123'));assert.ok(text.includes('Please call me.'));assert.ok(!text.includes('undefined'));assert.ok(!text.includes('Email:'));
});
