import os
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By


def create_subscriber(driver):
    driver.get(os.environ['CATALYST_SERVER'] + ":1443/logout")
    driver.get(os.environ['CATALYST_SERVER'] + ":1443")
    driver.find_element_by_xpath(
        '//*[@id="username"]').send_keys('administrator')
    driver.find_element_by_xpath(
        '//*[@id="password"]').send_keys('administrator')
    driver.find_element_by_xpath('//*[@id="submit"]').click()
    driver.find_element_by_xpath(
        '//*[@id="main-nav"]//*[contains(text(),"Settings")]').click()
    driver.find_element_by_link_text('Customers').click()
    hoverclick = ActionChains(driver)
    hoverclick.move_to_element(driver.find_element_by_xpath(
        '//*[@id="Customer_table"]//tr[1]'))
    hoverclick.click(driver.find_element_by_xpath(
        '//*[@id="Customer_table"]//tr[1]//td//a[contains(text(), '
        '"Details")]')
    )
    hoverclick.perform()
    driver.find_element_by_link_text('Expand Groups').click()
    driver.execute_script(
        'arguments[0].scrollIntoView();',
        driver.find_element_by_link_text('Subscribers')
    )
    driver.find_element_by_link_text("Create Subscriber").click()
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable(
        (By.XPATH, '//*[@id="domainidtable_paginate"]/a[4]')))
    driver.find_element_by_xpath(
        '//*[@id="domainidtable_paginate"]/a[4]').click()
    driver.find_element_by_xpath(
        '//*[@id="domainidtable"]//tr[1]//td//input[@type="checkbox"]'
    ).click()
    driver.find_element_by_xpath(
        '//*[@id="webusername"]').send_keys('testuser')
    driver.find_element_by_xpath(
        '//*[@id="webpassword"]').send_keys('testpasswd')
    driver.find_element_by_xpath(
        '//*[@id="username"]').send_keys('testuser')
    driver.find_element_by_xpath(
        '//*[@id="password"]').send_keys('testpasswd')
    driver.find_element_by_xpath('//*[@id="save"]').click()


def delete_subscriber(driver):
    driver.get(os.environ['CATALYST_SERVER'] + ":1443/logout")
    driver.get(os.environ['CATALYST_SERVER'] + ":1443")
    driver.find_element_by_xpath(
        '//*[@id="username"]').send_keys('administrator')
    driver.find_element_by_xpath(
        '//*[@id="password"]').send_keys('administrator')
    driver.find_element_by_xpath('//*[@id="submit"]').click()
    driver.find_element_by_xpath(
        '//*[@id="main-nav"]//*[contains(text(),"Settings")]').click()
    driver.find_element_by_link_text('Customers').click()
    hoverclick = ActionChains(driver)
    hoverclick.move_to_element(driver.find_element_by_xpath(
        '//*[@id="Customer_table"]//tr[1]'))
    hoverclick.click(driver.find_element_by_xpath(
        '//*[@id="Customer_table"]//tr[1]//td//a[contains(text(), '
        '"Details")]')
    )
    hoverclick.perform()
    driver.find_element_by_link_text('Expand Groups').click()
    driver.execute_script(
        'arguments[0].scrollIntoView();',
        driver.find_element_by_link_text('Subscribers')
    )
    WebDriverWait(driver, 1)
    hoverclick = ActionChains(driver)
    hoverclick.move_to_element(driver.find_element_by_xpath(
        '//*[@id="subscribers_table"]//tr[1]'))
    hoverclick.click(driver.find_element_by_xpath(
        '//*[@id="subscribers_table"]//tr[1]//td//a[contains(text(), '
        '"Terminate")]')
    )
    hoverclick.perform()
    driver.find_element_by_xpath('//*[@id="dataConfirmOK"]').click()
